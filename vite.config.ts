import { defineConfig } from "vite";

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
  }
});
