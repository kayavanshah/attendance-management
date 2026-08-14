import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

try {
  registerFont(path.join(process.cwd(), 'src/fonts/Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
  registerFont(path.join(process.cwd(), 'src/fonts/Roboto-Regular.ttf'), { family: 'Roboto', weight: 'normal' });
} catch (e) {
  console.warn('Failed to load local fonts for canvas, falling back to system fonts:', e);
}

export function generateSecureToken() {
  return uuidv4();
}

export async function generateQRCode(token: string) {
  try {
    return await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error(err);
    return '';
  }
}

export async function generateQRCodeWithLabel(token: string, name: string, id: string) {
  try {
    // Generate base QR
    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const canvas = createCanvas(400, 480);
    const ctx = canvas.getContext('2d');

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 480);

    // Load and draw QR code
    const img = await loadImage(qrDataUrl);
    ctx.drawImage(img, 0, 0, 400, 400);

    // Draw Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 200, 430);

    // Draw ID
    ctx.font = '20px Roboto, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`ID: ${id}`, 200, 460);

    return canvas.toDataURL();
  } catch (err) {
    console.error('Error generating labeled QR:', err);
    return await generateQRCode(token); // Fallback to raw QR
  }
}
