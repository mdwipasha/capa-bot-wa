import sharp from 'sharp';
import gifenc from 'gifenc';

const { GIFEncoder, applyPalette, quantize } = gifenc;

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

const textFrameSvg = ({ text, offsetX = 0, offsetY = 0, scale = 1, rotate = 0 }) => {
  const canvasSize = 512;
  const padding = 24;
  const maxWidth = canvasSize - (padding * 2);
  let fontSize = 80;
  let lines = [];

  while (fontSize > 30) {
    lines = wrapText(text, fontSize, maxWidth);
    if (lines.length * fontSize * 1.18 <= 410) break;
    fontSize -= 4;
  }

  const lineHeight = fontSize * 1.18;
  const textHeight = lines.length * lineHeight;
  const startY = (canvasSize - textHeight) / 2 + (fontSize * 0.82);
  const tspans = lines.map((line, index) => (
    `<tspan x="256" y="${startY + (index * lineHeight)}">${escapeXml(line)}</tspan>`
  )).join('');

  return Buffer.from(`<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1.5" dy="1.5" stdDeviation="0.45" flood-color="#000000" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="512" height="512" fill="#ffffff"/>
    <g transform="translate(${offsetX} ${offsetY}) rotate(${rotate} 256 256) scale(${scale}) translate(${(1 - scale) * 256} ${(1 - scale) * 256})" filter="url(#softShadow)">
      <text text-anchor="middle" fill="#111111" font-family="Arial Narrow, Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="400" letter-spacing="-2">${tspans}</text>
    </g>
  </svg>`);
};

const renderRgbaFrame = async (svg) => {
  const { data } = await sharp(svg)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return new Uint8Array(data);
};

export const textToGif = async (value) => {
  const text = String(value).replace(/\r/g, '').trim().slice(0, 180);
  const width = 512;
  const height = 512;
  const motions = [
    { offsetX: -4, offsetY: 2, scale: 0.99, rotate: -0.8 },
    { offsetX: 3, offsetY: -2, scale: 1.01, rotate: 0.7 },
    { offsetX: -2, offsetY: -3, scale: 1.02, rotate: -0.4 },
    { offsetX: 4, offsetY: 1, scale: 1, rotate: 0.5 },
    { offsetX: 0, offsetY: 3, scale: 0.99, rotate: -0.6 },
    { offsetX: -3, offsetY: -1, scale: 1.01, rotate: 0.4 },
    { offsetX: 2, offsetY: -2, scale: 1.02, rotate: -0.2 },
    { offsetX: 0, offsetY: 0, scale: 1, rotate: 0 }
  ];

  const gif = GIFEncoder();
  for (const motion of motions) {
    const rgba = await renderRgbaFrame(textFrameSvg({
      text,
      ...motion
    }));
    const palette = quantize(rgba, 128, { format: 'rgb565' });
    const frame = applyPalette(rgba, palette, 'rgb565');
    gif.writeFrame(frame, width, height, {
      palette,
      delay: 85,
      repeat: 0
    });
  }
  gif.finish();
  return Buffer.from(gif.bytes());
};

export const textToAnimatedSticker = async (value) => {
  const text = String(value).replace(/\r/g, '').trim().slice(0, 180);
  const words = text.split(/\s+/).filter(Boolean).slice(0, 18);
  const frames = [];
  const phrases = words.length
    ? words.map((_, index) => words.slice(0, index + 1).join(' '))
    : [text];

  for (const phrase of phrases) {
    frames.push(await renderRgbaFrame(textFrameSvg({ text: phrase })));
  }

  for (let i = 0; i < 3; i += 1) {
    frames.push(await renderRgbaFrame(textFrameSvg({
      text: phrases.at(-1),
      offsetX: i % 2 ? 2 : -2,
      offsetY: i % 2 ? -1 : 1,
      rotate: i % 2 ? 0.25 : -0.25
    })));
  }

  const gif = GIFEncoder();
  for (const [index, rgba] of frames.entries()) {
    const palette = quantize(rgba, 128, { format: 'rgb565' });
    const frame = applyPalette(rgba, palette, 'rgb565');
    gif.writeFrame(frame, 512, 512, {
      palette,
      delay: index < phrases.length ? 360 : 120,
      repeat: 0
    });
  }
  gif.finish();

  return sharp(Buffer.from(gif.bytes()), { animated: true })
    .webp({
      quality: 88,
      loop: 0,
      effort: 4
    })
    .toBuffer();
};

export const stickerToPng = async (buffer) => sharp(buffer, { animated: true })
  .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
  .png()
  .toBuffer();
