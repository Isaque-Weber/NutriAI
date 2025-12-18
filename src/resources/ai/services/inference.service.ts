import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { engine } from './factories/engine.factory';
import { ConfigService } from '@nestjs/config';
import { PatientRepository } from '../../clinical/domain/repositories/patient.repository';
import { AnamnesisRepository } from '../../clinical/domain/repositories/anamnesis.repository';
import { AnthropometricAssessmentRepository } from '../../clinical/domain/repositories/anthropometric-assessment.repository';
import { createClinicalTools } from '../tools/clinical.tools';
import { KnowledgeService } from './knowledge.service';
import { AutoRetrievalService } from './auto-retrieval.service';
import { createKnowledgeTool } from '../tools/knowledge.tool';

@Injectable()
export class InferenceService {
  private readonly DEFAULT_SYSTEM_PROMPT = `Você é o NutriAI, um assistente virtual especializado em nutrição.
Seu objetivo é ajudar nutricionistas e pacientes com dúvidas sobre alimentação, saúde e bem-estar.
Você tem acesso a ferramentas para consultar dados clínicos do paciente atual e uma base de conhecimento global.
Use-as sempre que precisar de informações precisas ou técnicas.
Seja sempre cordial, profissional e baseie suas respostas em evidências científicas quando possível.
Se não souber a resposta, admita e sugira que o usuário procure um profissional.`;

  constructor(
    private readonly configService: ConfigService,
    private readonly patientRepository: PatientRepository,
    private readonly anamnesisRepository: AnamnesisRepository,
    private readonly assessmentRepository: AnthropometricAssessmentRepository,
    private readonly knowledgeService: KnowledgeService,
    private readonly autoRetrievalService: AutoRetrievalService,
  ) {}

  async executeInference(conversation: Conversation) {
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage?.role !== 'user')
      throw new InternalServerErrorException(
        `[${InferenceService.name}] A última mensagem da conversa não é de usuário.`,
      );

    const userMessage = lastMessage.content || '';

    // Get patient info for context and multi-tenancy check
    const patient = await this.patientRepository.findOneById(
      conversation.patientId,
    );
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    const nutritionistId = patient.nutritionistId;

    // Get relevant global context via Auto-Retrieval
    const globalContext =
      await this.autoRetrievalService.getRelevantContext(userMessage);

    const messages = this.convertToLangChainMessages(conversation.messages);

    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY')!;

    // Initialize the engine
    const llm = engine(apiKey);

    // Create tools for this context
    const clinicalTools = createClinicalTools(
      this.patientRepository,
      this.anamnesisRepository,
      this.assessmentRepository,
      nutritionistId,
      conversation.patientId,
    );

    const knowledgeTool = createKnowledgeTool(this.knowledgeService);

    const tools = [...clinicalTools, knowledgeTool];

    // Create the agent with tools
    const agent = createReactAgent({
      llm,
      tools,
    });

    const context = {
      user: {
        name: patient.name,
      },
      date: {
        dateCurrent: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'America/Sao_Paulo',
        }),
        timeCurrent: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Sao_Paulo',
        }),
      },
    };

    const systemPrompt = `${this.DEFAULT_SYSTEM_PROMPT}
    
Contexto do Usuário:
Nome: ${context.user.name}
Data Atual: ${context.date.dateCurrent} ${context.date.timeCurrent}

${globalContext}`;

    const result = await agent.invoke({
      messages: [new SystemMessage(systemPrompt), ...messages],
    });

    return {
      answer: result.messages[result.messages.length - 1]?.content as string,
    };
  }

  private convertToLangChainMessages(messages: Message[]): BaseMessage[] {
    const langChainMessages: BaseMessage[] = [];
    const lastMessages = messages.slice(-20);

    for (const message of lastMessages) {
      const content = message.content || '';
      switch (message.role) {
        case MessageRole.USER:
          langChainMessages.push(new HumanMessage(content));
          break;
        case MessageRole.ASSISTANT:
          langChainMessages.push(new AIMessage(content));
          break;
      }
    }

    return langChainMessages;
  }
}
