import QRCode from 'qrcode';

const flipMap = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
  k: 'ʞ', l: 'ʃ', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '?': '¿', '!': '¡', '.': '˙'
};

const morseMap = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
  i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
  q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
  y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.'
};

export const fancyText = (text) => text.replace(/[A-Za-z0-9]/g, (char) => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + code - 97);
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + code - 48);
  return char;
});

export const flipText = (text) => [...text.toLowerCase()].reverse().map((char) => flipMap[char] || char).join('');
export const reverseText = (text) => [...text].reverse().join('');
export const toMorse = (text) => [...text.toLowerCase()].map((char) => char === ' ' ? '/' : morseMap[char] || char).join(' ');
export const toBinary = (text) => [...Buffer.from(text, 'utf8')].map((byte) => byte.toString(2).padStart(8, '0')).join(' ');
export const fromBinary = (text) => Buffer.from(text.split(/\s+/).map((bin) => parseInt(bin, 2))).toString('utf8');
export const toBase64 = (text) => Buffer.from(text, 'utf8').toString('base64');
export const fromBase64 = (text) => Buffer.from(text, 'base64').toString('utf8');
export const qrBuffer = (text) => QRCode.toBuffer(text, { width: 512, margin: 2 });

export const detectLanguage = (text) => {
  if (/[ぁ-んァ-ン]/.test(text)) return 'Japanese';
  if (/[\uac00-\ud7af]/.test(text)) return 'Korean';
  if (/[\u0600-\u06ff]/.test(text)) return 'Arabic';
  if (/\b(the|and|is|are|you|what)\b/i.test(text)) return 'English';
  if (/\b(dan|yang|aku|kamu|tidak|apa)\b/i.test(text)) return 'Indonesian';
  return 'Unknown';
};
