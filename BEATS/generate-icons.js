// This script requires the following npm packages to be installed:
// npm install sharp fs-extra

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fse = require('fs-extra');

// Output directories
const outputDirs = {
  icons: 'assets/img/icons',
  screenshots: 'assets/img/screenshots'
};

// Create output directories if they don't exist
Object.values(outputDirs).forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fse.ensureDirSync(dirPath);
    console.log(`Created directory: ${dirPath}`);
  }
});

// Generate a simple icon with the BEATS logo
async function generateIcon(size, outputPath) {
  try {
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#1DB954"/>
        <circle cx="50" cy="50" r="35" fill="#FFFFFF"/>
        <path d="M40,35 L70,50 L40,65 Z" fill="#1DB954"/>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .toFile(outputPath);
      
    console.log(`Generated icon: ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`Error generating icon ${outputPath}:`, error);
  }
}

// Generate all required icons
async function generateAllIcons() {
  // Favicon
  await generateIcon(32, path.join(__dirname, 'favicon.ico'));
  
  // Apple Touch Icons
  await generateIcon(180, path.join(__dirname, outputDirs.icons, 'apple-touch-icon.png'));
  
  // Android/Chrome Icons
  await generateIcon(192, path.join(__dirname, outputDirs.icons, 'android-chrome-192x192.png'));
  await generateIcon(512, path.join(__dirname, outputDirs.icons, 'android-chrome-512x512.png'));
  
  // Favicon variants
  await generateIcon(16, path.join(__dirname, outputDirs.icons, 'favicon-16x16.png'));
  await generateIcon(32, path.join(__dirname, outputDirs.icons, 'favicon-32x32.png'));
  
  // Microsoft Tiles
  await generateIcon(70, path.join(__dirname, outputDirs.icons, 'mstile-70x70.png'));
  await generateIcon(150, path.join(__dirname, outputDirs.icons, 'mstile-150x150.png'));
  await generateIcon(310, path.join(__dirname, outputDirs.icons, 'mstile-310x310.png'));
  
  // Safari Pinned Tab
  const safariSvg = `
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6" fill="#1DB954"/>
      <path d="M6,5 L11,8 L6,11 Z" fill="#FFFFFF"/>
    </svg>
  `;
  
  await sharp(Buffer.from(safariSvg))
    .toFile(path.join(__dirname, outputDirs.icons, 'safari-pinned-tab.svg'));
    
  console.log('Generated Safari pinned tab icon');
  
  console.log('\nAll icons generated successfully!');
  console.log('Make sure to update your HTML with the correct paths to these icons.');
}

// Run the generator
generateAllIcons().catch(console.error);
