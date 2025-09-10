const fs = require('fs');
const path = require('path');

console.log('📁 Copying all assets...');

// Copy all asset folders to dist/assets
const assetFolders = ['buttons', 'categories', 'flags', 'gift', 'misc', 'models', 'popup', 'room'];
const srcAssetsDir = path.resolve(__dirname, 'src', 'assets');
const distAssetsDir = path.resolve(__dirname, 'dist', 'assets');

if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir, { recursive: true });
}

const copyFolderRecursive = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

assetFolders.forEach(folder => {
  const srcPath = path.join(srcAssetsDir, folder);
  const destPath = path.join(distAssetsDir, folder);
  
  if (fs.existsSync(srcPath)) {
    copyFolderRecursive(srcPath, destPath);
    console.log(`✅ Copied assets/${folder} to dist folder`);
  } else {
    console.log(`⚠️  Warning: assets/${folder} not found`);
  }
});

console.log('🎉 All assets copied successfully!');
