/**
 * CommandParser
 * -------------
 * Parser profesional untuk teks pesan WhatsApp.
 *
 * Support:
 *   - Multi-prefix (single, multiple, no-prefix, regex)
 *   - Quoted arguments ("arg dengan spasi")
 *   - Flags boolean  (--flag, -f)
 *   - Named options  (--key=value, --key value)
 *   - Reply context  (quoted message)
 *   - Mention parse  (@JID)
 *   - Media detection
 *   - URL detection
 *   - Raw args array
 */

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const MENTION_REGEX = /@(\d+)/g;

export class CommandParser {
  /**
   * @param {object} options
   * @param {string[]} options.prefixes - daftar prefix yang digunakan
   * @param {string|RegExp|null} [options.regexPrefix] - custom regex prefix (opsional)
   */
  constructor({ prefixes = ['.'], regexPrefix = null } = {}) {
    this.prefixes = prefixes.map((p) => String(p));
    this.regexPrefix = regexPrefix instanceof RegExp ? regexPrefix : null;
  }

  // ─────────────────────────────────────────────
  // Main Parse
  // ─────────────────────────────────────────────

  /**
   * Parse pesan menjadi context yang siap digunakan command.
   *
   * @param {object} options
   * @param {object} options.msg - Baileys message object
   * @param {string} options.text - teks pesan yang sudah di-sanitize
   * @param {string|null} [options.botId] - ID bot session
   * @returns {object|null} ParsedContext atau null jika tidak match prefix
   */
  parse({ msg, text, botId = null }) {
    const prefixResult = this._matchPrefix(text);
    if (!prefixResult) return null; // tidak match prefix apapun

    const { prefix, rest } = prefixResult;
    const trimmed = rest.trim();

    if (!trimmed) return null; // tidak ada command setelah prefix

    // Tokenize dengan support quoted strings
    const tokens = this._tokenize(trimmed);
    if (!tokens.length) return null;

    const [rawCommandName, ...rawArgs] = tokens;
    const commandName = rawCommandName.toLowerCase();

    // Parse flags dan named options dari args
    const { args, flags, options: namedOptions } = this._parseArgs(rawArgs);

    // Parse reply context
    const quoted = this._parseQuoted(msg);

    // Parse mentions
    const mentions = this._parseMentions(text);

    // Parse media
    const media = this._parseMedia(msg);

    // Parse URLs dari teks
    const urls = this._parseUrls(text);

    return {
      // Prefix & Command
      prefix,
      commandName,
      rawText: text,
      bodyText: trimmed,

      // Arguments
      args,           // array string (clean args tanpa flags)
      rawArgs,        // semua token setelah commandName
      body: args.join(' '), // join args sebagai string

      // Flags (boolean): --flag atau -f
      flags,          // Set of flag names

      // Named options: --key=value atau --key value
      options: namedOptions, // { key: value }

      // Quoted message (reply context)
      quoted,

      // Media context
      media,

      // Mentions
      mentions,

      // URLs
      urls,

      // Helper shortcuts
      isReply: Boolean(quoted),
      hasMedia: Boolean(media.type),
      hasMention: mentions.length > 0,
      hasUrl: urls.length > 0,

      // Meta
      botId
    };
  }

  // ─────────────────────────────────────────────
  // Prefix Detection
  // ─────────────────────────────────────────────

  /**
   * Cek apakah teks match dengan salah satu prefix.
   * @param {string} text
   * @returns {{ prefix: string, rest: string }|null}
   */
  _matchPrefix(text) {
    if (!text) return null;

    // Regex prefix (prioritas tertinggi)
    if (this.regexPrefix) {
      const match = text.match(this.regexPrefix);
      if (match) {
        return { prefix: match[0], rest: text.slice(match[0].length) };
      }
    }

    // String prefixes
    for (const prefix of this.prefixes) {
      if (text.startsWith(prefix)) {
        return { prefix, rest: text.slice(prefix.length) };
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────
  // Tokenizer (support quoted strings)
  // ─────────────────────────────────────────────

  /**
   * Tokenize string dengan support quoted arguments.
   * Contoh: 'hello "world foo" bar' → ['hello', 'world foo', 'bar']
   * @param {string} text
   * @returns {string[]}
   */
  _tokenize(text) {
    const tokens = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (!inQuote && (char === '"' || char === "'")) {
        inQuote = true;
        quoteChar = char;
        continue;
      }

      if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = '';
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      if (!inQuote && char === ' ') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) tokens.push(current);
    return tokens;
  }

  // ─────────────────────────────────────────────
  // Args Parser
  // ─────────────────────────────────────────────

  /**
   * Parse array token menjadi args, flags, dan named options.
   *
   * Format yang didukung:
   *   --flag          → flags.has('flag') === true
   *   -f              → flags.has('f') === true
   *   --key=value     → options.key === 'value'
   *   --key value     → options.key === 'value'
   *   regular         → args.push('regular')
   *
   * @param {string[]} tokens
   * @returns {{ args: string[], flags: Set<string>, options: object }}
   */
  _parseArgs(tokens) {
    const args = [];
    const flags = new Set();
    const options = {};

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Long flag dengan nilai: --key=value
      if (token.startsWith('--') && token.includes('=')) {
        const eqIdx = token.indexOf('=');
        const key = token.slice(2, eqIdx).toLowerCase();
        const value = token.slice(eqIdx + 1);
        options[key] = value;
        continue;
      }

      // Long flag: --flag atau --key value
      if (token.startsWith('--')) {
        const key = token.slice(2).toLowerCase();
        // Cek apakah token berikutnya adalah value (bukan flag)
        const next = tokens[i + 1];
        if (next && !next.startsWith('-')) {
          options[key] = next;
          i++; // skip next token
        } else {
          flags.add(key);
        }
        continue;
      }

      // Short flag: -f atau -abc (multi-flag)
      if (token.startsWith('-') && token.length > 1 && !/^-\d/.test(token)) {
        const chars = token.slice(1);
        for (const char of chars) flags.add(char.toLowerCase());
        continue;
      }

      // Regular argument
      args.push(token);
    }

    return { args, flags, options };
  }

  // ─────────────────────────────────────────────
  // Reply Context Parser
  // ─────────────────────────────────────────────

  /**
   * Parse quoted (reply) message.
   * @param {object} msg - Baileys message
   * @returns {object|null}
   */
  _parseQuoted(msg) {
    try {
      const msgContent = msg.message;
      if (!msgContent) return null;

      // Cari contextInfo di berbagai tipe pesan
      const contentTypes = [
        'extendedTextMessage',
        'imageMessage',
        'videoMessage',
        'audioMessage',
        'documentMessage',
        'stickerMessage',
        'buttonsResponseMessage',
        'listResponseMessage'
      ];

      for (const type of contentTypes) {
        const ctx = msgContent[type]?.contextInfo;
        if (ctx?.quotedMessage) {
          const quoted = ctx.quotedMessage;
          const quotedType = Object.keys(quoted)[0];
          return {
            key: {
              id: ctx.stanzaId,
              remoteJid: ctx.remoteJid || msg.key.remoteJid,
              participant: ctx.participant
            },
            message: quoted,
            type: quotedType,
            text: this._extractText(quoted),
            isMedia: ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(quotedType)
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────────
  // Media Context Parser
  // ─────────────────────────────────────────────

  /**
   * Parse media dari pesan.
   * @param {object} msg - Baileys message
   * @returns {{ type: string|null, mimetype: string|null, ... }}
   */
  _parseMedia(msg) {
    const msgContent = msg.message;
    if (!msgContent) return { type: null };

    const mediaTypes = {
      imageMessage: 'image',
      videoMessage: 'video',
      audioMessage: 'audio',
      documentMessage: 'document',
      stickerMessage: 'sticker'
    };

    for (const [key, type] of Object.entries(mediaTypes)) {
      if (msgContent[key]) {
        const media = msgContent[key];
        return {
          type,
          mimetype: media.mimetype || null,
          fileLength: media.fileLength || null,
          fileName: media.fileName || null,
          caption: media.caption || null,
          message: msgContent[key]
        };
      }
    }

    return { type: null };
  }

  // ─────────────────────────────────────────────
  // Mention Parser
  // ─────────────────────────────────────────────

  /**
   * Extract semua mention dari teks.
   * @param {string} text
   * @returns {string[]} array JID yang di-mention
   */
  _parseMentions(text) {
    const mentions = [];
    let match;
    MENTION_REGEX.lastIndex = 0;
    while ((match = MENTION_REGEX.exec(text)) !== null) {
      mentions.push(`${match[1]}@s.whatsapp.net`);
    }
    return mentions;
  }

  // ─────────────────────────────────────────────
  // URL Parser
  // ─────────────────────────────────────────────

  /**
   * Extract semua URL dari teks.
   * @param {string} text
   * @returns {string[]}
   */
  _parseUrls(text) {
    return text.match(URL_REGEX) || [];
  }

  // ─────────────────────────────────────────────
  // Text Extractor
  // ─────────────────────────────────────────────

  /**
   * Extract teks dari berbagai tipe pesan.
   * @param {object} msgContent
   * @returns {string}
   */
  _extractText(msgContent) {
    if (!msgContent) return '';
    return (
      msgContent.conversation ||
      msgContent.extendedTextMessage?.text ||
      msgContent.imageMessage?.caption ||
      msgContent.videoMessage?.caption ||
      msgContent.documentMessage?.caption ||
      ''
    );
  }
}
