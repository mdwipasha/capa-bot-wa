import { config } from './env.js';

export const aiApis = {
  chatgpt: {
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKey: config.ai.openaiApiKey
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    apiKey: config.ai.geminiApiKey
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-latest',
    apiKey: config.ai.claudeApiKey
  }
};

export const downloaderApis = config.downloaders;
