import sharp from 'sharp';

const escapeXml = (value = '') => value.replace(/[<>&'"]/g, (char) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;'
}[char]));

const stickerCanvas = async (buffer) => {
  const resized = await sharp(buffer)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();

  return { canvas: sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }), resized };
};

export const imageToWebp = async (buffer, watermark = '') => {
  const { canvas, resized } = await stickerCanvas(buffer);
  const composites = [{ input: resized, gravity: 'center' }];
  if (watermark) {
    const safeWatermark = escapeXml(watermark.slice(0, 32));
    const svg = Buffer.from(`<svg width="512" height="512">
      <rect x="0" y="456" width="512" height="56" fill="rgba(0,0,0,0.42)"/>
      <text x="256" y="492" text-anchor="middle" fill="white" font-size="28" font-family="Arial" font-weight="700">${safeWatermark}</text>
    </svg>`);
    composites.push({ input: svg, left: 0, top: 0 });
  }
  return canvas.composite(composites).webp({ quality: 90 }).toBuffer();
};

const characterWidth = (char) => {
  if (char === ' ') return 0.42;
  if (/[ilI1.,'!:;|]/.test(char)) return 0.25;
  if (/[?()[\]{}]/.test(char)) return 0.4;
  if (/[mwMW@%&]/.test(char)) return 0.7;
  if (/[A-Z0-9]/.test(char)) return 0.58;
  return 0.43;
};

const textWidth = (text, fontSize) => (
  [...text].reduce((width, char) => width + characterWidth(char), 0) * fontSize
);

const breakWord = (word, fontSize, maxWidth) => {
  const chunks = [];
  let chunk = '';
  for (const char of word) {
    if (chunk && textWidth(chunk + char, fontSize) > maxWidth) {
      chunks.push(chunk);
      chunk = char;
    } else {
      chunk += char;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
};

const wrapText = (text, fontSize, maxWidth) => {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }

    let line = '';
    for (const word of words) {
      const chunks = textWidth(word, fontSize) > maxWidth
        ? breakWord(word, fontSize, maxWidth)
        : [word];
      for (const chunk of chunks) {
        const candidate = line ? `${line} ${chunk}` : chunk;
        if (line && textWidth(candidate, fontSize) > maxWidth) {
          lines.push(line);
          line = chunk;
        } else {
          line = candidate;
        }
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

export const textToWebp = async (value) => {
  const text = String(value).replace(/\r/g, '').trim().slice(0, 280);
  const canvasSize = 512;
  const contentHeight = 450;
  const padding = 24;
  const maxWidth = canvasSize - (padding * 2);
  const maxHeight = contentHeight - (padding * 2);
  let fontSize = 80;
  let lines = [];

  while (fontSize > 30) {
    lines = wrapText(text, fontSize, maxWidth);
    const lineHeight = fontSize * 1.18;
    if (lines.length * lineHeight <= maxHeight) break;
    fontSize -= 4;
  }

  const lineHeight = fontSize * 1.18;
  const tspans = lines.map((line, index) => (
    `<tspan x="${padding}" y="${padding + (fontSize * 0.84) + (index * lineHeight)}">${escapeXml(line)}</tspan>`
  )).join('');
  const background = Buffer.from(`<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${canvasSize}" height="${contentHeight}" fill="#ffffff"/>
  </svg>`);
  const textLayer = Buffer.from(`<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
    <text fill="#111111" font-family="Arial Narrow, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="400" word-spacing="12">${tspans}</text>
  </svg>`);
  const softenedText = await sharp(textLayer).blur(0.65).png().toBuffer();

  return sharp(background)
    .composite([{ input: softenedText }])
    .webp({ quality: 84 })
    .toBuffer();
};
