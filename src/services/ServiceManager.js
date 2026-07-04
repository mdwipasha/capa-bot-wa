import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import {
  GeminiAIProvider,
  OpenAIProvider,
  OpenRouterAIProvider,
  OllamaAIProvider,
  CustomAIProvider,
  ClaudeAIProvider
} from './providers/AIProvider.js';
import {
  BtchDownloaderProvider,
  CobaltDownloaderProvider,
  TikWmDownloaderProvider
} from './providers/DownloaderProvider.js';
import { SharpImageProvider } from './providers/ImageProvider.js';
import { MyMemoryTranslateProvider } from './providers/TranslateProvider.js';
import { LocalOCRProvider } from './providers/OCRProvider.js';
import { GoogleSpeechProvider } from './providers/SpeechProvider.js';
import { OpenMeteoWeatherProvider } from './providers/WeatherProvider.js';
import {
  WikipediaSearchProvider,
  DuckDuckGoSearchProvider,
  JikanSearchProvider,
  OMDBSearchProvider,
  LyricsSearchProvider,
  RecipeSearchProvider,
  PrayerScheduleProvider
} from './providers/SearchProvider.js';

class CacheManager {
  constructor() {
    this.cache = new Map();
  }
  set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  delete(key) {
    this.cache.delete(key);
  }
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) this.cache.delete(key);
    }
  }
}

export class ServiceManager extends EventEmitter {
  constructor({ loggerService } = {}) {
    super();
    this.logger = loggerService || logger;
    this.botManager = null;
    this.config = null;
    this.providers = new Map();
    this.cache = new CacheManager();

    // Auto-clean expired cache items every minute
    this.cacheInterval = setInterval(() => this.cache.clearExpired(), 60000);

    // Initialize Service Interfaces
    this._initServiceInterfaces();
  }

  setBotManager(botManager) {
    this.botManager = botManager;
  }

  registerProvider(serviceType, provider) {
    if (!this.providers.has(serviceType)) {
      this.providers.set(serviceType, []);
    }
    this.providers.get(serviceType).push(provider);
    this.logger.info?.({ category: 'service', message: `Registered provider "${provider.name}" under service: ${serviceType}` });
  }

  init(config) {
    this.config = config;

    // AI Providers
    this.registerProvider('ai', new GeminiAIProvider('Gemini', config.ai));
    this.registerProvider('ai', new OpenAIProvider('OpenAI', config.ai));
    this.registerProvider('ai', new OpenRouterAIProvider('OpenRouter', config.ai));
    this.registerProvider('ai', new OllamaAIProvider('Ollama', config.ai));
    this.registerProvider('ai', new CustomAIProvider('CustomAI', config.ai));
    this.registerProvider('ai', new ClaudeAIProvider('Claude', config.ai));

    // Downloader Providers
    this.registerProvider('downloader', new BtchDownloaderProvider('BtchDownloader'));
    this.registerProvider('downloader', new CobaltDownloaderProvider('Cobalt', config.downloaders));
    this.registerProvider('downloader', new TikWmDownloaderProvider('TikWm', config.downloaders));

    // Image/PDF/QR Providers
    this.registerProvider('image', new SharpImageProvider('SharpImage'));

    // Translate Providers
    this.registerProvider('translate', new MyMemoryTranslateProvider('MyMemoryTranslate'));

    // OCR Providers
    this.registerProvider('ocr', new LocalOCRProvider('LocalOCR'));

    // Speech Providers
    this.registerProvider('speech', new GoogleSpeechProvider('GoogleSpeech'));

    // Weather Providers
    this.registerProvider('weather', new OpenMeteoWeatherProvider('OpenMeteoWeather'));

    // Search Providers
    this.registerProvider('search', new DuckDuckGoSearchProvider('DuckDuckGoSearch'));
    this.registerProvider('search', new WikipediaSearchProvider('WikipediaSearch'));
    const jikan = new JikanSearchProvider('JikanSearch');
    this.registerProvider('search', jikan);
    this.registerProvider('search', new OMDBSearchProvider('OMDBSearch'));
    this.registerProvider('search', new LyricsSearchProvider('LyricsSearch'));
    this.registerProvider('search', new RecipeSearchProvider('RecipeSearch'));
    this.registerProvider('search', new PrayerScheduleProvider('PrayerSchedule'));
  }

  async executeWithQueue(queueName, actionFn, priority = 0) {
    if (!this.botManager?.queueManager) {
      return await actionFn();
    }
    
    return new Promise((resolve, reject) => {
      const job = this.botManager.queueManager.enqueue(queueName, {
        executeCallback: async (j, updateProgress) => {
          return await actionFn(updateProgress);
        }
      }, { priority });
      
      const onFinished = (payload) => {
        if (payload.job?.id === job.id) {
          cleanup();
          resolve(payload.result);
        }
      };
      
      const onFailed = (payload) => {
        if (payload.job?.id === job.id) {
          cleanup();
          reject(new Error(payload.error || 'Job failed'));
        }
      };
      
      const onCancelled = (payload) => {
        if (payload.job?.id === job.id) {
          cleanup();
          reject(new Error('Job cancelled'));
        }
      };
      
      const cleanup = () => {
        this.botManager.queueManager.off('queue.finished', onFinished);
        this.botManager.queueManager.off('queue.failed', onFailed);
        this.botManager.queueManager.off('queue.cancelled', onCancelled);
      };

      this.botManager.queueManager.on('queue.finished', onFinished);
      this.botManager.queueManager.on('queue.failed', onFailed);
      this.botManager.queueManager.on('queue.cancelled', onCancelled);
    });
  }

  async executeWithFallback(serviceType, actionName, runOnProvider, options = {}) {
    let providers = [...(this.providers.get(serviceType) || [])];
    if (providers.length === 0) {
      throw new Error(`No providers registered for service: ${serviceType}`);
    }

    if (options.provider) {
      const primary = providers.find((p) => p.name.toLowerCase() === options.provider.toLowerCase());
      if (primary) {
        providers = [primary, ...providers.filter((p) => p !== primary)];
      }
    }

    const cacheKey = `${serviceType}:${actionName}:${JSON.stringify(options.cacheKey || '')}`;
    if (options.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null && cached !== undefined) {
        this.logger.info?.({ category: 'service', message: `Cache hit for ${cacheKey}` });
        return cached;
      }
    }

    let lastError = null;
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      this.emit('service.request', { service: serviceType, provider: provider.name, action: actionName });
      
      let attempt = 0;
      const maxRetries = options.retry || 2;
      const timeoutMs = options.timeout || 15000;
      const startTime = Date.now();

      while (attempt <= maxRetries) {
        try {
          // Timeout race
          const resultPromise = this.executeWithQueue(options.queueName || 'Message Queue', async (updateProgress) => {
            return await runOnProvider(provider, updateProgress);
          }, options.priority || 0);

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              this.emit('provider.timeout', { service: serviceType, provider: provider.name, timeout: timeoutMs });
              reject(new Error(`Timeout of ${timeoutMs}ms exceeded on provider ${provider.name}`));
            }, timeoutMs);
          });

          const result = await Promise.race([resultPromise, timeoutPromise]);
          const latency = Date.now() - startTime;
          
          this.logger.success?.({ category: 'service', message: `Service ${serviceType}.${actionName} succeeded via ${provider.name} in ${latency}ms` });
          this.emit('service.success', { service: serviceType, provider: provider.name, action: actionName, latency });
          
          if (options.useCache !== false && options.ttl) {
            this.cache.set(cacheKey, result, options.ttl);
          }
          
          return result;
        } catch (err) {
          const isRateLimit = err.response?.status === 429 || err.message?.toLowerCase().includes('rate limit');
          
          if (isRateLimit && attempt < maxRetries) {
            attempt++;
            const backoff = 1000 * Math.pow(2, attempt);
            this.logger.warn?.({ category: 'service', message: `Rate limit on ${provider.name}. Backing off for ${backoff}ms...` });
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }
          
          lastError = err;
          this.logger.error?.({ category: 'service', message: `Provider ${provider.name} failed action ${actionName}: ${err.message}` });
          
          if (i < providers.length - 1) {
            this.emit('provider.changed', { service: serviceType, oldProvider: provider.name, newProvider: providers[i + 1].name });
          }
          
          break; // break retry loop and try the next provider
        }
      }
    }

    this.emit('service.failed', { service: serviceType, action: actionName, error: lastError?.message });
    throw new Error(`All providers for ${serviceType} failed. Last error: ${lastError?.message}`);
  }

  _initServiceInterfaces() {
    this.ai = {
      ask: (prompt, options = {}) => this.executeWithFallback('ai', 'ask', (p, up) => p.ask(prompt, options), {
        queueName: 'AI Queue',
        cacheKey: prompt,
        useCache: options.useCache,
        ttl: options.ttl || 300000,
        ...options
      })
    };

    this.downloader = {
      download: (url, type, options = {}) => this.executeWithFallback('downloader', 'download', (p, up) => p.download(url, type, options), {
        queueName: 'Download Queue',
        useCache: false,
        ...options
      })
    };

    this.image = {
      applyEffect: (buffer, effect, options = {}) => this.executeWithFallback('image', 'applyEffect', (p, up) => p.applyEffect(buffer, effect), {
        queueName: 'Image Queue',
        useCache: false,
        ...options
      }),
      toPdf: (buffer, options = {}) => this.executeWithFallback('image', 'toPdf', (p, up) => p.toPdf(buffer), {
        queueName: 'Image Queue',
        useCache: false,
        ...options
      }),
      qrBuffer: (text, options = {}) => this.executeWithFallback('image', 'qrBuffer', (p, up) => p.qrBuffer(text), {
        queueName: 'Image Queue',
        useCache: true,
        cacheKey: text,
        ttl: options.ttl || 600000,
        ...options
      })
    };

    this.translate = {
      translate: (text, target, options = {}) => this.executeWithFallback('translate', 'translate', (p, up) => p.translate(text, target), {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `${text}:${target}`,
        ttl: options.ttl || 3600000,
        ...options
      })
    };

    this.ocr = {
      readQr: (buffer, options = {}) => this.executeWithFallback('ocr', 'readQr', (p, up) => p.readQr(buffer), {
        queueName: 'OCR Queue',
        useCache: false,
        ...options
      }),
      readBarcode: (buffer, options = {}) => this.executeWithFallback('ocr', 'readBarcode', (p, up) => p.readBarcode(buffer), {
        queueName: 'OCR Queue',
        useCache: false,
        ...options
      }),
      readPdf: (buffer, options = {}) => this.executeWithFallback('ocr', 'readPdf', (p, up) => p.readPdf(buffer), {
        queueName: 'OCR Queue',
        useCache: false,
        ...options
      })
    };

    this.speech = {
      textToSpeech: (text, lang, options = {}) => this.executeWithFallback('speech', 'textToSpeech', (p, up) => p.textToSpeech(text, lang), {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `${text}:${lang}`,
        ttl: options.ttl || 3600000,
        ...options
      })
    };

    this.weather = {
      forecast: (city, options = {}) => this.executeWithFallback('weather', 'forecast', (p, up) => p.forecast(city), {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: city,
        ttl: options.ttl || 1800000,
        ...options
      })
    };

    this.search = {
      wikipedia: (query, options = {}) => this.executeWithFallback('search', 'wikipedia', (p, up) => {
        if (p.wikipedia) return p.wikipedia(query);
        throw new Error('Wikipedia search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `wiki:${query}`,
        ttl: options.ttl || 86400000,
        ...options
      }),
      googleLikeSearch: (query, options = {}) => this.executeWithFallback('search', 'googleLikeSearch', (p, up) => {
        if (p.googleLikeSearch) return p.googleLikeSearch(query);
        throw new Error('Web search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `google:${query}`,
        ttl: options.ttl || 3600000,
        ...options
      }),
      animeSearch: (query, options = {}) => this.executeWithFallback('search', 'animeSearch', (p, up) => {
        if (p.animeSearch) return p.animeSearch(query);
        throw new Error('Anime search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `anime:${query}`,
        ttl: options.ttl || 3600000,
        ...options
      }),
      characterSearch: (query, options = {}) => this.executeWithFallback('search', 'characterSearch', (p, up) => {
        if (p.characterSearch) return p.characterSearch(query);
        throw new Error('Character search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `char:${query}`,
        ttl: options.ttl || 3600000,
        ...options
      }),
      mangaSearch: (query, options = {}) => this.executeWithFallback('search', 'mangaSearch', (p, up) => {
        if (p.mangaSearch) return p.mangaSearch(query);
        throw new Error('Manga search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `manga:${query}`,
        ttl: options.ttl || 3600000,
        ...options
      }),
      animeQuote: (options = {}) => this.executeWithFallback('search', 'animeQuote', (p, up) => {
        if (p.animeQuote) return p.animeQuote();
        throw new Error('Anime quotes are not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: false,
        ...options
      }),
      movieSearch: (query, options = {}) => this.executeWithFallback('search', 'movieSearch', (p, up) => {
        if (p.movieSearch) return p.movieSearch(query);
        throw new Error('Movie search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `movie:${query}`,
        ttl: options.ttl || 86400000,
        ...options
      }),
      lyrics: (artist, title, options = {}) => this.executeWithFallback('search', 'lyrics', (p, up) => {
        if (p.lyrics) return p.lyrics(artist, title);
        throw new Error('Lyrics search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `lyrics:${artist}:${title}`,
        ttl: options.ttl || 604800000,
        ...options
      }),
      recipe: (query, options = {}) => this.executeWithFallback('search', 'recipe', (p, up) => {
        if (p.recipe) return p.recipe(query);
        throw new Error('Recipe search is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `recipe:${query}`,
        ttl: options.ttl || 86400000,
        ...options
      }),
      prayerSchedule: (city, options = {}) => this.executeWithFallback('search', 'prayerSchedule', (p, up) => {
        if (p.prayerSchedule) return p.prayerSchedule(city);
        throw new Error('Prayer schedule is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `prayer:${city}`,
        ttl: options.ttl || 43200000,
        ...options
      }),
      currencyRate: (from, to, options = {}) => this.executeWithFallback('search', 'currencyRate', (p, up) => {
        if (p.currencyRate) return p.currencyRate(from, to);
        throw new Error('Currency rate is not supported by this provider');
      }, {
        queueName: 'Message Queue',
        useCache: true,
        cacheKey: `currency:${from}:${to}`,
        ttl: options.ttl || 3600000,
        ...options
      })
    };
  }

  destroy() {
    if (this.cacheInterval) clearInterval(this.cacheInterval);
  }
}

export const serviceManager = new ServiceManager();
