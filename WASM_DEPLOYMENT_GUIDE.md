# WASM Deployment Guide for GitHub Pages

## Issue: HavokPhysics.wasm 404 Error

The error you're seeing:
```
/havok/HavokPhysics.wasm:1 Failed to load resource: the server responded with a status of 404 ()
```

This happens because GitHub Pages doesn't serve WASM files with the correct MIME type by default.

## Solutions

### Solution 1: Test the WASM File
1. Deploy your site to GitHub Pages
2. Visit `https://yourusername.github.io/swingpuzzles.github.io/test-wasm.html`
3. This will test if the WASM file is loading correctly

### Solution 2: GitHub Pages Configuration
1. Go to your GitHub repository
2. Settings → Pages
3. Make sure the source is set to "Deploy from a branch"
4. Select the "gh-pages" branch
5. Save

### Solution 3: Check File Structure
After deployment, verify these files exist:
- `https://yourusername.github.io/swingpuzzles.github.io/havok/HavokPhysics.wasm`
- `https://yourusername.github.io/swingpuzzles.github.io/index.html`

### Solution 4: Alternative Deployment
If GitHub Pages continues to have issues with WASM files, consider:
- **Netlify**: Better WASM support
- **Vercel**: Good for static sites
- **GitHub Actions**: More control over deployment

## Current Build Process
```bash
# Complete build (includes WASM copying)
npx tsc && npx vite build && node copy-legal-pages.js && node copy-all-assets.js && node copy-havok.js
```

## Files Included in Deployment
- ✅ `index.html` - Main game
- ✅ `privacy-policy.html` - Privacy policy
- ✅ `terms-of-service.html` - Terms of service
- ✅ `cookie-policy.html` - Cookie policy
- ✅ `havok/HavokPhysics.wasm` - Physics engine
- ✅ `assets/` - All game assets
- ✅ `test-wasm.html` - WASM test page

## Testing Locally
```bash
# Build and test locally
npm run build
npx vite preview
# Visit http://localhost:4173/test-wasm.html
```

## Troubleshooting
1. **404 Error**: Check if the file exists in the gh-pages branch
2. **MIME Type Error**: GitHub Pages should handle this automatically
3. **CORS Error**: This is normal for local development, should work on GitHub Pages

The WASM file is valid and should work once properly deployed to GitHub Pages.
