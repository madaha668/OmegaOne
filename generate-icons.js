const fs = require('fs');
const path = require('path');

// Simple PNG creation using data URLs
// This creates basic icons that work for development/testing

function createSimplePNG(size, color = '#667eea') {
  // Create a simple data URL PNG
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size/8}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/3}" fill="white" text-anchor="middle" dy="0.35em" font-weight="bold">Ω</text>
  </svg>`;

  return Buffer.from(canvas).toString('base64');
}

// Create a minimal PNG header for a solid color square
function createMinimalPNG(size, r, g, b) {
  const width = size;
  const height = size;
  
  // This is a very basic PNG structure - for production use a proper PNG library
  // For now, we'll create data URL PNGs that browsers can handle
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#gradient)" rx="${width/8}"/>
    <circle cx="${width/2}" cy="${height/2}" r="${width/3}" fill="none" stroke="white" stroke-width="${width/16}"/>
    <path d="M${width*0.35} ${height*0.3} Q${width*0.35} ${height*0.25} ${width*0.45} ${height*0.25} L${width*0.55} ${height*0.25} Q${width*0.65} ${height*0.25} ${width*0.65} ${height*0.3} L${width*0.65} ${height*0.45} Q${width*0.65} ${height*0.55} ${width*0.55} ${height*0.6} L${width*0.52} ${height*0.62} L${width*0.68} ${height*0.75} L${width*0.58} ${height*0.75} L${width*0.48} ${height*0.65} L${width*0.52} ${height*0.65} L${width*0.42} ${height*0.75} L${width*0.32} ${height*0.75} L${width*0.48} ${height*0.62} L${width*0.45} ${height*0.6} Q${width*0.35} ${height*0.55} ${width*0.35} ${height*0.45} Z" fill="white"/>
  </svg>`;
  
  return svg;
}

// Create icon files
async function generateIcons() {
  const iconsDir = path.join(__dirname, 'icons');
  const sizes = [16, 32, 48, 128];
  
  console.log('Generating PNG icons...');
  
  for (const size of sizes) {
    const svgContent = createMinimalPNG(size);
    const fileName = `icon${size}.svg`;
    const filePath = path.join(iconsDir, fileName);
    
    // Write SVG versions that browsers can use as PNG alternatives
    fs.writeFileSync(filePath, svgContent);
    console.log(`Created ${fileName} (${size}x${size})`);
  }
  
  // Also create a simple PNG-like data for the manifest
  // Modern browsers accept SVG in manifests, so we'll use our original SVG
  console.log('\nIcons generated successfully!');
  console.log('Note: Created SVG files that browsers will accept.');
  console.log('For production, consider using online tools to convert to actual PNG files.');
  console.log('\nAlternative: Use https://convertio.co/svg-png/ to convert icon.svg to PNG files');
}

generateIcons().catch(console.error);