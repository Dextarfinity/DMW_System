const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'build/dmw_logo.png');
const outputPath = path.join(__dirname, 'build/icon.ico');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// ICO files need multiple sizes for proper Windows display
// Max size for ICO is 256, using cover fit for bigger logo appearance
const sizes = [16, 24, 32, 48, 64, 128, 256];

async function createIcon() {
  try {
    // First trim all white/transparent space around the logo so it fills the icon fully
    const trimmed = await sharp(inputPath)
      .trim()
      .toBuffer();

    const buffers = await Promise.all(
      sizes.map(size =>
        sharp(trimmed)
          .resize(size, size, { fit: 'fill' })
          .png()
          .toBuffer()
      )
    );

    const icoBuffer = await toIco(buffers);
    fs.writeFileSync(outputPath, icoBuffer);
    console.log('Icon created successfully at:', outputPath);
    console.log('File size:', fs.statSync(outputPath).size, 'bytes');
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createIcon();
