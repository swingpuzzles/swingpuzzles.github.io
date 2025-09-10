const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to GitHub Pages...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('yarn build', { stdio: 'inherit' });
  
  // Copy legal pages
  console.log('📄 Copying legal pages...');
  execSync('node copy-legal-pages.js', { stdio: 'inherit' });
  
  // Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('gh-pages -d dist -b gh-pages', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
  console.log('🔗 Your site should be available at: https://yourusername.github.io/swingpuzzles.github.io/');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
