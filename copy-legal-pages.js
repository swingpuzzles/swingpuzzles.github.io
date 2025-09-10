const fs = require('fs');
const path = require('path');

// Copy legal pages to dist folder
const legalPages = ['privacy-policy.html', 'terms-of-service.html', 'cookie-policy.html'];
const distDir = path.resolve(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

legalPages.forEach(page => {
  const srcPath = path.resolve(__dirname, 'src', page);
  const destPath = path.resolve(distDir, page);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${page} to dist folder`);
  } else {
    console.log(`Warning: ${page} not found in src folder`);
  }
});

console.log('Legal pages copied successfully!');
