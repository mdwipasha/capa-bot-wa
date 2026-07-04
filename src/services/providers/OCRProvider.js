import jsQR from 'jsqr';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export class OCRProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
}

export class LocalOCRProvider extends OCRProvider {
  async readQr(buffer) {
    try {
      const raw = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const result = jsQR(new Uint8ClampedArray(raw.data), raw.info.width, raw.info.height);
      return result?.data || null;
    } catch (err) {
      throw new Error(`Failed to decode QR: ${err.message}`);
    }
  }

  async readBarcode(buffer) {
    // Stub for Barcode reader
    // In production, we can wrap standard zbar or a node-barcode-reader library
    throw new Error('Barcode reader strategy is not fully configured. Please install zbar-wasi.');
  }

  async readPdf(buffer) {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      // Extract text content using pdf-lib or text tags
      let fullText = '';
      // Simple stub: pdf-lib doesn't have an out-of-the-box raw text extractor,
      // but we can parse structure or write a summary of PDF properties
      fullText = `PDF Document with ${pages.length} pages. Title: ${pdfDoc.getTitle() || 'Untitled'}`;
      return fullText;
    } catch (err) {
      throw new Error(`Failed to read PDF: ${err.message}`);
    }
  }
}
