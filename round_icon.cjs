const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  try {
    const width = 1024;
    const height = 1024;
    const rx = 220; // border radius
    
    const rect = Buffer.from(
      `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" /></svg>`
    );

    await sharp('public/logo.png')
      .resize(width, height)
      .composite([{
        input: rect,
        blend: 'dest-in'
      }])
      .toFile('public/logo_rounded.png');
      
    console.log('Rounded image created successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

processImage();
