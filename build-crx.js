#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple CRX3 builder using zip and OpenSSL
function buildCRX(extensionDir, keyPath, outputPath) {
  console.log('Building CRX file...');
  
  // Create temporary zip file
  const tempZip = path.join(__dirname, 'temp-extension.zip');
  
  try {
    // Create ZIP file excluding build artifacts
    const zipCommand = `zip -r "${tempZip}" . -x "build/*" "dist/*" "node_modules/*" "*.zip" "*.crx" "*.pem" ".git/*" "docker/*" "Makefile" "build-crx.js"`;
    execSync(zipCommand, { cwd: extensionDir, stdio: 'inherit' });
    
    // Use crx3 npm package programmatically for better error handling
    const crx3 = require('crx3');
    
    return crx3([path.join(extensionDir, 'manifest.json')], {
      keyPath: keyPath,
      crxPath: outputPath,
      zipPath: tempZip
    }).then(() => {
      console.log(`CRX file created: ${outputPath}`);
      // Clean up temp file
      if (fs.existsSync(tempZip)) {
        fs.unlinkSync(tempZip);
      }
    }).catch(error => {
      console.error('CRX3 build failed:', error.message);
      
      // Fallback: just use the ZIP file
      if (fs.existsSync(tempZip)) {
        fs.copyFileSync(tempZip, outputPath.replace('.crx', '.zip'));
        fs.unlinkSync(tempZip);
        console.log(`Created ZIP package instead: ${outputPath.replace('.crx', '.zip')}`);
      }
      throw error;
    });
    
  } catch (error) {
    console.error('Build failed:', error.message);
    
    // Clean up temp file on error
    if (fs.existsSync(tempZip)) {
      fs.unlinkSync(tempZip);
    }
    
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.log('Usage: node build-crx.js <extension-dir> <key-path> <output-path>');
    process.exit(1);
  }
  
  const [extensionDir, keyPath, outputPath] = args;
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  buildCRX(extensionDir, keyPath, outputPath);
}

module.exports = { buildCRX };