import sharp from 'sharp';

/**
 * Generates an SVG string for a Brat sticker (white background, black lowercase bold text)
 */
const generateBratSvg = (text, size = 512, bgColor = '#ffffff', textColor = '#000000') => {
  const cleanText = text.toLowerCase().trim();
  
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
  
  // Calculate sizing and vertical position
  const fontSize = lines.length > 3 ? 55 : 68;
  const lineHeight = fontSize - 4;
  const textHeight = lines.length * lineHeight;
  
  // Vertically centered, left-aligned with a nice indent
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
  name: 'texttosticker',
  alias: ['tts2s', 't2s', 'brat'],
  category: 'sticker',
  description: 'Buat sticker gaya BRAT (teks hitam di latar putih, huruf kecil).',
  cooldownMs: 3000,
  async execute({ sock, msg, args, prefix }) {
    const text = args.join(' ').trim();
    if (!text) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `Masukkan teks untuk stiker BRAT.\nContoh: ${prefix}brat halo dunia`
      }, { quoted: msg });
    }
    
    if (text.length > 100) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'Teks terlalu panjang, maksimal 100 karakter.' }, { quoted: msg });
    }
    
    try {
      // Check if user wants brat-green background
      let bgColor = '#ffffff';
      let textColor = '#000000';
      
      const svg = generateBratSvg(text, 512, bgColor, textColor);
      const sticker = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
      
      return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal membuat stiker: ${error.message}` }, { quoted: msg });
    }
  }
};
