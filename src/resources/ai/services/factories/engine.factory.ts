import { ChatOpenAI } from '@langchain/openai';

export const engine = (
  apiKey: string,
  model: string = 'google/gemini-2.0-flash-exp:free',
  temperature: number = 0,
) => {
  return new ChatOpenAI({
    modelName: model,
    temperature: temperature,
    apiKey: apiKey,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  });
};
