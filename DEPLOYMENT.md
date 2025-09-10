# Deployment Guide for GitHub Pages

## Quick Deployment

Run this command to deploy to GitHub Pages:

```bash
yarn deploy
```

This will:
1. Build the project (`yarn build`)
2. Copy legal pages to the dist folder
3. Deploy to GitHub Pages using the `gh-pages` package

## Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Build the project
yarn build

# 2. Deploy to GitHub Pages
gh-pages -d dist -b gh-pages
```

## GitHub Pages Configuration

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch
6. Click "Save"

## File Structure

After deployment, your site will have:
- `index.html` - Main game page
- `privacy-policy.html` - Privacy policy
- `terms-of-service.html` - Terms of service  
- `cookie-policy.html` - Cookie policy
- `index.js` - Compiled game code
- `havok/` - Physics engine files

## Troubleshooting

If the site doesn't appear:
1. Check that the `gh-pages` branch was created
2. Verify GitHub Pages is configured to use the `gh-pages` branch
3. Wait a few minutes for GitHub Pages to update
4. Check the Actions tab for any deployment errors

## Legal Pages

The legal pages are automatically copied to the dist folder during build. They are located in:
- `src/privacy-policy.html`
- `src/terms-of-service.html` 
- `src/cookie-policy.html`

These will be accessible at:
- `https://yourusername.github.io/swingpuzzles.github.io/privacy-policy.html`
- `https://yourusername.github.io/swingpuzzles.github.io/terms-of-service.html`
- `https://yourusername.github.io/swingpuzzles.github.io/cookie-policy.html`
