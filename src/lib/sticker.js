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

export const memeImage = async (buffer, top = '', bottom = '') => {
  const safeTop = escapeXml(top.slice(0, 32).toUpperCase());
  const safeBottom = escapeXml(bottom.slice(0, 32).toUpperCase());
  const svg = Buffer.from(`<svg width="768" height="768">
    <style>.m{fill:white;stroke:black;stroke-width:4px;font-size:54px;font-family:Impact,Arial;font-weight:900}</style>
    <text x="384" y="70" text-anchor="middle" class="m">${safeTop}</text>
    <text x="384" y="730" text-anchor="middle" class="m">${safeBottom}</text>
  </svg>`);
  return sharp(buffer).resize(768, 768, { fit: 'contain', background: '#000' }).composite([{ input: svg }]).jpeg({ quality: 92 }).toBuffer();
};
