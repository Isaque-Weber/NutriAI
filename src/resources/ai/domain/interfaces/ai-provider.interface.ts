export interface AiProvider {
  name: string;
  generateResponse(prompt: string): Promise<string>;
}
