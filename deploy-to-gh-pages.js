const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to GitHub Pages...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npx tsc && npx vite build && node copy-legal-pages.js && node copy-all-assets.js && node copy-havok.js', { stdio: 'inherit' });
  
  // Legal pages and assets are already copied during build
  
  // Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist -b gh-pages', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
  console.log('🔗 Your site should be available at: https://yourusername.github.io/swingpuzzles.github.io/');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
