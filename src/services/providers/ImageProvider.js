import sharp from 'sharp';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';

export class ImageProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
}

export class SharpImageProvider extends ImageProvider {
  async applyEffect(buffer, effect) {
    const base = sharp(buffer).rotate().resize(768, 768, { fit: 'inside', withoutEnlargement: false });

    if (effect === 'sketch') {
      return base
        .grayscale()
        .blur(0.3)
        .sharpen({ sigma: 2, m1: 2.5, m2: 0.8 })
        .linear(1.9, -70)
        .threshold(145)
        .png()
        .toBuffer();
    }

    if (effect === 'pixel') {
      return base
        .resize(72, 72, { kernel: 'nearest', fit: 'inside' })
        .resize(768, 768, { kernel: 'nearest', fit: 'inside' })
        .modulate({ saturation: 1.35, brightness: 1.04 })
        .png()
        .toBuffer();
    }

    if (effect === 'cartoon') {
      return base
        .median(5)
        .modulate({ saturation: 2.2, brightness: 1.08 })
        .linear(1.18, -14)
        .sharpen({ sigma: 1.5 })
        .png()
        .toBuffer();
    }

    if (effect === 'colorize') {
      return base
        .modulate({ saturation: 2.4, brightness: 1.08, hue: 18 })
        .gamma(1.12)
        .png()
        .toBuffer();
    }

    return base.png().toBuffer();
  }

  async toPdf(buffer) {
    const png = await sharp(buffer).png().toBuffer();
    const meta = await sharp(png).metadata();
    const pdf = await PDFDocument.create();
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([meta.width || 512, meta.height || 512]);
    page.drawImage(image, { x: 0, y: 0, width: meta.width || 512, height: meta.height || 512 });
    return Buffer.from(await pdf.save());
  }

  async qrBuffer(text) {
    return QRCode.toBuffer(text, { width: 512, margin: 2 });
  }
}
