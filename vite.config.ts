import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  root: "src", // Serve files from the `src/` folder
  build: {
    outDir: "../dist", // Output compiled files to `dist/`
    emptyOutDir: true // Empty the output directory before building
  },
  server: {
    open: true, // Auto open in browser
    port: 3000 // Change the port if needed
  },
  optimizeDeps: {
    include: ["ammojs-typed"]
  },
  plugins: [
    {
      name: 'wasm-mime-fix',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
            const filePath = path.join(__dirname, 'dist', req.url);
            if (fs.existsSync(filePath)) {
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      }
    },
    {
      name: 'copy-legal-pages',
      writeBundle() {
        // Copy legal pages to dist folder
        const legalPages = ['privacy-policy.html', 'terms-of-service.html', 'cookie-policy.html'];
        const distDir = path.resolve(__dirname, 'dist');
        
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        
        legalPages.forEach(page => {
          const srcPath = path.resolve(__dirname, 'src', page);
          const destPath = path.resolve(distDir, page);
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
            console.log(`Copied ${page} to dist folder`);
          }
        });
      }
    }
  ]
});
