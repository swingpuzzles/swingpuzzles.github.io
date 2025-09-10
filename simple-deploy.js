const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple deployment...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npx tsc && npx vite build && node copy-legal-pages.js && node copy-all-assets.js', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Your dist folder is ready for deployment.');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Go to your GitHub repository');
  console.log('2. Go to Settings → Pages');
  console.log('3. Select "Deploy from a branch"');
  console.log('4. Create a new branch called "gh-pages"');
  console.log('5. Upload the contents of the "dist" folder to the gh-pages branch');
  console.log('6. Set the source to the gh-pages branch');
  console.log('');
  console.log('📂 Or use this command to create the gh-pages branch:');
  console.log('git checkout --orphan gh-pages');
  console.log('git rm -rf .');
  console.log('cp -r dist/* .');
  console.log('git add .');
  console.log('git commit -m "Deploy to GitHub Pages"');
  console.log('git push origin gh-pages');
  console.log('git checkout main');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
