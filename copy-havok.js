const fs = require('fs');
const path = require('path');

console.log('🔧 Copying HavokPhysics.wasm...');

const srcPath = path.resolve(__dirname, 'node_modules', '@babylonjs', 'havok', 'lib', 'esm', 'HavokPhysics.wasm');
const destDir = path.resolve(__dirname, 'dist', 'havok');
const destPath = path.join(destDir, 'HavokPhysics.wasm');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('📁 Created dist/havok directory');
}

// Copy the file
if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath);
  console.log('✅ Copied HavokPhysics.wasm to dist/havok/');
} else {
  console.error('❌ HavokPhysics.wasm not found at:', srcPath);
  process.exit(1);
}

// Also copy the test file
const testFileSrc = path.resolve(__dirname, 'dist', 'test-wasm.html');
const testFileDest = path.resolve(__dirname, 'dist', 'test-wasm.html');

if (fs.existsSync(testFileSrc)) {
  console.log('✅ Test file already exists');
} else {
  console.log('ℹ️  Test file not found - you can create it manually if needed');
}

console.log('🎉 HavokPhysics.wasm copied successfully!');
