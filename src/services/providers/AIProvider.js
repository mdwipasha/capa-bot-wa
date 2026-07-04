import axios from 'axios';

export class AIProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
  async ask(prompt, options = {}) {
    throw new Error('Method ask() must be implemented');
  }
}

export class GeminiAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
    
    const baseUrl = this.config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // retry logic specific to gemini rate limit
    let attempt = 0;
    const maxRetries = 1;
    while (attempt <= maxRetries) {
      try {
        const { data } = await axios.post(`${baseUrl}?key=${apiKey}`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: options.maxTokens || 1024 }
        }, { timeout: options.timeout || 15000 });
        
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer from Gemini.';
      } catch (err) {
        if (err.response?.status === 429 && attempt < maxRetries) {
          attempt++;
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        throw err;
      }
    }
  }
}

export class OpenAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
    
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1/chat/completions';
    const model = this.config.model || 'gpt-4o-mini';
    
    const { data } = await axios.post(baseUrl, {
      model,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: options.timeout || 15000
    });
    
    return data.choices?.[0]?.message?.content || 'No answer from OpenAI.';
  }
}

export class OpenRouterAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const apiKey = this.config.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

    const baseUrl = this.config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
    const model = this.config.model || 'google/gemini-2.0-flash-exp:free';

    const { data } = await axios.post(baseUrl, {
      model,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/mdwipasha/capa-bot-wa',
        'X-Title': 'WhatsApp Bot Service Manager'
      },
      timeout: options.timeout || 15000
    });

    return data.choices?.[0]?.message?.content || 'No answer from OpenRouter.';
  }
}

export class OllamaAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434/api/generate';
    const model = this.config.model || 'llama3';
    
    const { data } = await axios.post(baseUrl, {
      model,
      prompt,
      stream: false
    }, {
      timeout: options.timeout || 15000
    });
    
    return data.response || 'No answer from Ollama.';
  }
}

export class CustomAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const baseUrl = this.config.baseUrl;
    const apiKey = this.config.apiKey;
    if (!baseUrl) throw new Error('Custom AI baseUrl is not configured');

    const { data } = await axios.post(baseUrl, {
      prompt,
      ...options
    }, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      timeout: options.timeout || 15000
    });

    return data.result || data.text || data.response || JSON.stringify(data);
  }
}

export class ClaudeAIProvider extends AIProvider {
  async ask(prompt, options = {}) {
    const apiKey = this.config.apiKey || this.config.claudeApiKey || process.env.CLAUDE_API_KEY;
    if (!apiKey) throw new Error('CLAUDE_API_KEY is not configured');
    
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1/messages';
    const model = this.config.model || 'claude-3-5-haiku-latest';
    
    const { data } = await axios.post(baseUrl, {
      model,
      max_tokens: options.maxTokens || 800,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: options.timeout || 15000
    });
    
    return data.content?.[0]?.text || 'No answer from Claude.';
  }
}

