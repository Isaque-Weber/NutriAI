import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Conversation } from '../../conversations/domain/entities/conversation.entity';
import {
  Message,
  MessageRole,
} from '../../conversations/domain/entities/message.entity';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { PromptRepository } from '../../assistants/domain/repositories/prompt.repositories';
import { ConnectionToolRepository } from '../../assistants/domain/repositories/connection-tool.repositories';
import { ConnectionTool } from '../../assistants/domain/entities/connection-tool.entity';
import { KnowledgeRepository } from '../../assistants/domain/repositories/knowledge.repositories';
import { AssistantRepository } from '../../assistants/domain/repositories/assistant.repositories';
import { tool } from '@langchain/core/tools';
import { KnowledgeSearchTool } from '../tools/knowledge-search.tool';
import { AutoRetrievalService } from './auto-retrieval.service';
import axios from 'axios';
import { Assistant } from '../../assistants/domain/entities/assistant.entity';
import { engine } from '../factories/engine.factory';
import { PromptService } from './prompt/prompt.service';
import { log } from '../../../@shared/logging/logger';

@Injectable()
export class InferenceService {
  constructor(
    private readonly promptRepository: PromptRepository,
    private readonly promptService: PromptService,
    private readonly connectionToolRepository: ConnectionToolRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly assistantRepository: AssistantRepository,
    private readonly knowledgeSearchToolService: KnowledgeSearchTool,
    private readonly autoRetrievalService: AutoRetrievalService,
  ) {}

  async executeInference(conversation: Conversation) {
    const prompt = await this.getAssistantPrompt(conversation.assistantId);
    const assistant = await this.assistantRepository.findOneById(
      conversation.assistantId,
    );
    const connectionTools =
      await this.connectionToolRepository.findByAssistantId(
        conversation.assistantId,
      );
    const tools = this.convertConnectionToolsToLangGraphTools(connectionTools);
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!assistant)
      throw new InternalServerErrorException(
        `[${InferenceService.name}] Assistant não encontrado.`,
      );
    if (lastMessage?.role !== 'user')
      throw new InternalServerErrorException(
        `[${InferenceService.name}] A última mensagem da conversa não é de usuário.`,
      );

    const knowledges = await this.getKnowledge(assistant, conversation);
    if (knowledges?.tool) tools.push(knowledges.tool);

    const messages = this.convertToLangChainMessages(conversation.messages);

    const llm = engine(assistant.config.engine);

    const agent = createReactAgent({
      llm,
      tools,
    });

    const promptGenerated = this.promptService.generatePrompt({
      instructions: prompt,
      knowledge: knowledges?.instructions ?? '',
      context: {
        user: {
          name: conversation.contact?.name ?? 'Não identificado',
        },
        date: {
          dateCurrent: new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Sao_Paulo',
          }),
          dayOfWeekCurrent: new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            timeZone: 'America/Sao_Paulo',
          }),
          timeCurrent: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Sao_Paulo',
          }),
          timeZone: 'America/Sao_Paulo',
        },
      },
    });

    const result = await agent.invoke({
      messages: [new SystemMessage(promptGenerated), ...messages],
    });

    return {
      answer: result.messages[result.messages.length - 1]?.content as string,
    };
  }

  private async getAssistantPrompt(assistantId: string): Promise<string> {
    const prompt = await this.promptRepository.findByAssistantId(assistantId);
    if (!prompt) return '';
    return prompt.content;
  }

  private async executeHttpRequest(
    tool: ConnectionTool,
    input: any,
  ): Promise<string> {
    const { httpConfig } = tool;

    const requestConfig = await this.buildRequestConfig(httpConfig, input);

    const response = await axios({
      method: httpConfig.method.toLowerCase() as any,
      url: requestConfig.url,
      params: requestConfig.queryParams,
      headers: requestConfig.headers,
      data: requestConfig.body,
      timeout: httpConfig.timeoutMs || 10000,
    });

    return JSON.stringify(response.data, null, 2);
  }

  private async buildRequestConfig(httpConfig: any, input: any) {
    let url = httpConfig.url;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, any> = {};
    let body: any = {};

    for (const mapping of httpConfig.mappings || []) {
      const inputValue = this.getValueFromInput(input, mapping.path);

      if (inputValue !== undefined) {
        switch (mapping.target.kind) {
          case 'path':
            url = url.replace(
              `{${mapping.target.name}}`,
              encodeURIComponent(inputValue),
            );
            break;

          case 'query':
            queryParams[mapping.target.name] = inputValue;
            break;

          case 'header':
            headers[mapping.target.name] = inputValue;
            break;

          case 'body':
            if (mapping.target.jsonPath) {
              this.setValueAtPath(body, mapping.target.jsonPath, inputValue);
            } else {
              body = inputValue;
            }
            break;
        }
      }
    }

    if (httpConfig.path) {
      url = url.endsWith('/')
        ? url + httpConfig.path
        : url + '/' + httpConfig.path;
    }

    return {
      url,
      queryParams,
      headers,
      body: Object.keys(body).length > 0 ? body : undefined,
    };
  }

  private getValueFromInput(input: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj && obj[key], input);
  }

  private setValueAtPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private convertToLangChainMessages(messages: Message[]): BaseMessage[] {
    const langChainMessages: BaseMessage[] = [];

    const lastMessages = messages.slice(-30);

    for (const message of lastMessages) {
      switch (message.role) {
        case MessageRole.USER:
          langChainMessages.push(new HumanMessage(message.content));
          break;
        case MessageRole.ASSISTANT:
          langChainMessages.push(new AIMessage(message.content));
          break;
        case MessageRole.TOOL:
          langChainMessages.push(
            new ToolMessage({
              content: message.content,
              tool_call_id: message.toolCallId!,
            }),
          );
          break;
      }
    }

    return langChainMessages;
  }

  private convertConnectionToolsToLangGraphTools(
    connectionTools: ConnectionTool[],
  ): any[] {
    const tools: any[] = [];

    for (const connectionTool of connectionTools) {
      try {
        const langGraphTool = tool(
          async (input: any) => {
            try {
              return await this.executeHttpRequest(connectionTool, input);
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Erro desconhecido';
              return `Erro ao executar a ferramenta ${connectionTool.name}: ${errorMessage}`;
            }
          },
          {
            name: connectionTool.name,
            description: connectionTool.description,
            schema: JSON.parse(connectionTool.schema),
          },
        );

        tools.push(langGraphTool);
      } catch (error) {
        log.error(
          `Erro ao converter tool ${connectionTool.name}: ${JSON.stringify(error)}`,
          error,
        );
      }
    }

    return tools;
  }

  private async getKnowledge(
    assistant: Assistant,
    conversation: Conversation,
  ): Promise<{
    tool: any | null;
    instructions: string;
  } | null> {
    const availableKnowledge = await this.knowledgeRepository.findByAssistantId(
      conversation.assistantId,
    );
    const hasAutoRetrievalEnabled =
      assistant.config?.knowledges?.autoRetrieval === true;
    const hasToolBaseRetrievalEnabled =
      assistant.config?.knowledges?.toolBaseRetrieval === true;

    if (availableKnowledge && availableKnowledge.length > 0) {
      interface KnowledgeResponse {
        tool?: any;
        instructions: string;
      }
      const response: KnowledgeResponse = { instructions: '' };

      if (hasToolBaseRetrievalEnabled) {
        const knowledgeInfo = availableKnowledge
          .map((k) => `- Name: ${k.collection}\n- Quando usar: ${k.whenToUse}`)
          .join('\n\n');

        response.tool =
          this.knowledgeSearchToolService.createKnowledgeSearchTool(
            conversation.assistantId,
            conversation.organizationId,
          );
        response.instructions += `${knowledgeInfo}`;
      }

      if (hasAutoRetrievalEnabled) {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];
        const shouldRetrieve =
          hasAutoRetrievalEnabled &&
          this.autoRetrievalService.shouldTriggerAutoRetrieval(
            lastMessage.content,
          );

        if (shouldRetrieve) {
          const autoRetrievalResult =
            await this.autoRetrievalService.executeAutoRetrieval({
              userMessage: lastMessage.content,
              assistantId: conversation.assistantId,
              organizationId: conversation.organizationId,
              assistantConfig: assistant.config,
            });

          if (autoRetrievalResult.hasRelevantContext) {
            const extraContext = `
\n[Conhecimento recuperado automaticamente]
${autoRetrievalResult.retrievedContext}
IMPORTANTE: Avalie se o contexto acima é relevante para responder.
- Se for útil, use como fonte principal.
- Se não for suficiente, utilize ferramentas adicionais.`
              .replace(/\s+/g, ' ')
              .trim();

            response.instructions += `${extraContext}`;
          }
        }
      }

      return response as any;
    }
    return null;
  }
}
