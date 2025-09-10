const fs = require('fs');
const path = require('path');

console.log('🧪 Testing HavokPhysics.wasm file...');

const wasmPath = path.resolve(__dirname, 'dist', 'havok', 'HavokPhysics.wasm');

if (fs.existsSync(wasmPath)) {
  const stats = fs.statSync(wasmPath);
  console.log('✅ HavokPhysics.wasm exists');
  console.log(`📏 File size: ${stats.size} bytes`);
  
  // Check if it's a valid WASM file by reading the first 4 bytes
  const buffer = fs.readFileSync(wasmPath);
  const magic = buffer.slice(0, 4);
  const magicHex = magic.toString('hex');
  
  // WASM files should start with 0x00 0x61 0x73 0x6d (which is "\0asm")
  if (magicHex === '0061736d') {
    console.log('✅ Valid WASM file (correct magic number)');
  } else {
    console.log('❌ Invalid WASM file (magic number:', magicHex, ')');
    console.log('   Expected: 0061736d');
    console.log('   This suggests the file might be HTML (404 page)');
  }
} else {
  console.log('❌ HavokPhysics.wasm not found');
}

console.log('🎉 WASM file test completed!');
