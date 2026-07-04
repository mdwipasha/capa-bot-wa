import sharp from 'sharp';
import gifenc from 'gifenc';

const { GIFEncoder, quantize, applyPalette } = gifenc;

/**
 * Generates an SVG string for a Brat frame
 */
const generateBratFrameSvg = (text, size = 512, bgColor = '#ffffff', textColor = '#000000') => {
  const cleanText = text.toLowerCase();
  
  // Wrap text into multiple lines
  const maxChars = 14;
  const words = cleanText.split(/\s+/);
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  const fontSize = lines.length > 3 ? 55 : 68;
  const lineHeight = fontSize - 4;
  const textHeight = lines.length * lineHeight;
  const startY = (size - textHeight) / 2 + fontSize - 12;
  const indentX = 36;
  
  const escXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
  
  const textElements = lines.map((line, i) => 
    `<text x="${indentX}" y="${startY + i * lineHeight}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${fontSize}" fill="${textColor}" letter-spacing="-2.5" filter="url(#brat-blur)">${escXml(line)}</text>`
  ).join('\n');
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="brat-blur">
        <feGaussianBlur stdDeviation="0.9" />
      </filter>
    </defs>
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    ${textElements}
  </svg>`;
};

export default {
  name: 'bratgif',
  alias: ['bratg', 'tts2sgif', 't2sgif'],
  category: 'sticker',
  description: 'Buat stiker BRAT bergerak (typing animation).',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const text = args.join(' ').trim();
    if (!text) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `Masukkan teks untuk stiker BRAT bergerak.\nContoh: ${prefix}bratgif typing...`
      }, { quoted: msg });
    }
    
    if (text.length > 60) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'Teks terlalu panjang untuk versi bergerak (maksimal 60 karakter).' }, { quoted: msg });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang merender stiker bergerak...' }, { quoted: msg });
    
    try {
      const size = 512;
      const gif = GIFEncoder();
      
      // Generate frame texts for typing animation
      const framesText = [];
      for (let i = 1; i <= text.length; i++) {
        framesText.push(text.slice(0, i));
      }
      
      // Add extra static frames of the final text at the end for readability
      const totalHoldFrames = 8;
      for (let i = 0; i < totalHoldFrames; i++) {
        framesText.push(text);
      }
      
      // Process each frame
      for (const frameText of framesText) {
        const svg = generateBratFrameSvg(frameText, size, '#ffffff', '#000000');
        const frameRawBuffer = await sharp(Buffer.from(svg))
          .ensureAlpha()
          .raw()
          .toBuffer();
          
        const pixels = new Uint8ClampedArray(frameRawBuffer);
        const palette = quantize(pixels, 256);
        const indexedPixels = applyPalette(pixels, palette);
        
        // Fast delay (120ms) for typing, longer delay (1500ms) for the last static frame
        const isLastFrame = frameText === text && framesText.indexOf(frameText) === framesText.length - 1;
        const delay = isLastFrame ? 1500 : 120;
        
        gif.writeFrame(indexedPixels, size, size, { palette, delay });
      }
      
      gif.finish();
      const gifBuffer = Buffer.from(gif.bytes());
      
      // Convert animated GIF to animated WebP sticker using sharp
      const sticker = await sharp(gifBuffer, { animated: true }).webp({ quality: 90 }).toBuffer();
      
      return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal membuat stiker bergerak: ${error.message}` }, { quoted: msg });
    }
  }
};
