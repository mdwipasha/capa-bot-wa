import { serviceManager } from '../services/ServiceManager.js';

export const askChatGPT = async (prompt) => {
  return await serviceManager.ai.ask(prompt, { provider: 'OpenAI' });
};

export const askGemini = async (prompt) => {
  return await serviceManager.ai.ask(prompt, { provider: 'Gemini' });
};

export const askClaude = async (prompt) => {
  return await serviceManager.ai.ask(prompt, { provider: 'Claude' });
};
