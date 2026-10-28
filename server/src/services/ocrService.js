const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const Tesseract = require('tesseract.js');

/**
 * Creates an 8-bit grayscale BMP buffer from a grayscale byte array
 */
function create8bitBmpFromGrayscale(grayBuffer, width, height) {
  const padding = (4 - (width % 4)) % 4;
  const rowStride = width + padding;
  const imageSize = rowStride * height;
  const headerSize = 54 + 1024; // 1078 bytes
  const fileSize = headerSize + imageSize;

  const buf = Buffer.alloc(fileSize);
  // BMP Header (14 bytes)
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(headerSize, 10);

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(-height, 22); // Top-down row orientation
  buf.writeUInt16LE(1, 26); // Color planes
  buf.writeUInt16LE(8, 28); // 8 bits per pixel (grayscale)
  buf.writeUInt32LE(0, 30); // BI_RGB (uncompressed)
  buf.writeUInt32LE(imageSize, 34);
  buf.writeInt32LE(2835, 38); // 72 DPI (2835 ppm)
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(256, 46); // 256 color palette

  // 256-color grayscale palette (1024 bytes)
  let palOffset = 54;
  for (let i = 0; i < 256; i++) {
    buf[palOffset] = i;     // Blue
    buf[palOffset + 1] = i; // Green
    buf[palOffset + 2] = i; // Red
    buf[palOffset + 3] = 0; // Reserved
    palOffset += 4;
  }

  // Pixel rows with 4-byte boundary padding
  let srcOffset = 0;
  let dstOffset = headerSize;
  for (let y = 0; y < height; y++) {
    grayBuffer.copy(buf, dstOffset, srcOffset, srcOffset + width);
    srcOffset += width;
    dstOffset += width;
    for (let p = 0; p < padding; p++) {
      buf[dstOffset++] = 0;
    }
  }

  return buf;
}

/**
 * Downsamples RGB buffer to grayscale with max target width for fast, reliable OCR
 */
function downsampleRgbToGrayscale(rgbBuffer, srcWidth, srcHeight, targetWidth = 1200) {
  const scale = srcWidth > targetWidth ? targetWidth / srcWidth : 1;
  const outWidth = Math.round(srcWidth * scale);
  const outHeight = Math.round(srcHeight * scale);
  const grayBuffer = Buffer.alloc(outWidth * outHeight);

  for (let dy = 0; dy < outHeight; dy++) {
    const sy = Math.min(srcHeight - 1, Math.floor(dy / scale));
    const srcRowOffset = sy * srcWidth * 3;
    const dstRowOffset = dy * outWidth;

    for (let dx = 0; dx < outWidth; dx++) {
      const sx = Math.min(srcWidth - 1, Math.floor(dx / scale));
      const srcPx = srcRowOffset + sx * 3;
      const r = rgbBuffer[srcPx] || 0;
      const g = rgbBuffer[srcPx + 1] || 0;
      const b = rgbBuffer[srcPx + 2] || 0;
      // Standard ITU-R BT.601 luma formula
      grayBuffer[dstRowOffset + dx] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  return { buffer: grayBuffer, width: outWidth, height: outHeight };
}

/**
 * Extracts and performs OCR on images embedded in a PDF buffer
 * Supports both FlateDecode (Canva/raw PNG) and DCTDecode (scanned JPEG)
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>} Combined OCR text
 */
async function extractOcrTextFromPdfBuffer(pdfBuffer) {
  const uploadDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let extractedTextParts = [];
  let idx = 0;
  let imageCount = 0;

  while (idx < pdfBuffer.length && imageCount < 5) {
    const sStart = pdfBuffer.indexOf(Buffer.from('stream'), idx);
    if (sStart === -1) break;

    // Detect line break after 'stream' keyword
    let newlineOffset = 6;
    if (pdfBuffer[sStart + 6] === 0x0d && pdfBuffer[sStart + 7] === 0x0a) {
      newlineOffset = 8;
    } else if (pdfBuffer[sStart + 6] === 0x0a) {
      newlineOffset = 7;
    }

    const sEnd = pdfBuffer.indexOf(Buffer.from('endstream'), sStart);
    if (sEnd === -1) break;

    const streamDataStart = sStart + newlineOffset;
    const streamLen = sEnd - streamDataStart;

    // Inspect dictionary immediately preceding this stream
    const dictSnippet = pdfBuffer.subarray(Math.max(0, sStart - 400), sStart).toString('latin1');
    const isImage = dictSnippet.includes('/Subtype /Image') || dictSnippet.includes('/Subtype/Image');

    if (isImage && streamLen > 5000) {
      imageCount++;
      const isJpeg = dictSnippet.includes('/DCTDecode');
      const isFlate = dictSnippet.includes('/FlateDecode');

      // Extract width & height
      const widthMatch = dictSnippet.match(/\/Width\s+(\d+)/);
      const heightMatch = dictSnippet.match(/\/Height\s+(\d+)/);
      const width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
      const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;

      const randomId = crypto.randomBytes(8).toString('hex');
      let tempImagePath = null;

      try {
        if (isJpeg) {
          // Standard JPEG stream
          tempImagePath = path.join(uploadDir, `ocr_tmp_${Date.now()}_${randomId}.jpg`);
          fs.writeFileSync(tempImagePath, pdfBuffer.subarray(streamDataStart, sEnd));
        } else if (isFlate && width > 0 && height > 0) {
          // Inflate FlateDecode stream
          const rawStream = pdfBuffer.subarray(streamDataStart, sEnd);
          let uncompressed;
          try {
            uncompressed = zlib.inflateSync(rawStream);
          } catch (zlibErr) {
            uncompressed = zlib.inflateRawSync(rawStream);
          }

          // Convert to optimized grayscale BMP
          const isRGB = uncompressed.length >= width * height * 3;
          let grayResult;

          if (isRGB) {
            grayResult = downsampleRgbToGrayscale(uncompressed, width, height, 1200);
          } else {
            // Already 1-byte grayscale
            grayResult = { buffer: uncompressed.subarray(0, width * height), width, height };
          }

          const bmpBuffer = create8bitBmpFromGrayscale(
            grayResult.buffer,
            grayResult.width,
            grayResult.height
          );

          tempImagePath = path.join(uploadDir, `ocr_tmp_${Date.now()}_${randomId}.bmp`);
          fs.writeFileSync(tempImagePath, bmpBuffer);
        }

        if (tempImagePath && fs.existsSync(tempImagePath)) {
          console.log(`[OCR] Running character recognition on extracted image ${imageCount}...`);
          const ocrResult = await Tesseract.recognize(tempImagePath, 'eng');
          if (ocrResult && ocrResult.data && ocrResult.data.text) {
            const cleaned = ocrResult.data.text.trim();
            if (cleaned.length > 20) {
              extractedTextParts.push(cleaned);
              console.log(`[OCR] Extracted ${cleaned.length} characters from image ${imageCount}.`);
            }
          }
        }
      } catch (ocrErr) {
        console.warn(`[OCR] Warning: Failed processing image stream ${imageCount}:`, ocrErr.message);
      } finally {
        if (tempImagePath && fs.existsSync(tempImagePath)) {
          try {
            fs.unlinkSync(tempImagePath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }

    idx = sEnd + 9;
  }

  return extractedTextParts.join('\n\n');
}

module.exports = {
  extractOcrTextFromPdfBuffer
};
