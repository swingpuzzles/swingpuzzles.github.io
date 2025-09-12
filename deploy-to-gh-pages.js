const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to GitHub Pages...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npx tsc && npx vite build && node copy-legal-pages.js && node copy-all-assets.js && node copy-havok.js', { stdio: 'inherit' });
  
  // Create .nojekyll file to prevent Jekyll processing
  console.log('📝 Creating .nojekyll file...');
  const nojekyllPath = path.join(__dirname, 'dist', '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  
  // Create CNAME file for custom domain
  console.log('🌐 Setting up custom domain...');
  const cnamePath = path.join(__dirname, 'dist', 'CNAME');
  fs.writeFileSync(cnamePath, 'swingpuzzles.com');
  
  // Deploy to GitHub Pages
  console.log('🌐 Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist -b gh-pages --dotfiles', { stdio: 'inherit' });
  
  console.log('✅ Deployment completed successfully!');
  console.log('🔗 Your site should be available at: https://swingpuzzles.com');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
