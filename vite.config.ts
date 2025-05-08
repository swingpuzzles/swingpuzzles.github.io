import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: "src", // Serve files from the `src/` folder
  build: {
    outDir: "../dist" // Output compiled files to `dist/`
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
    }
  ]
});
