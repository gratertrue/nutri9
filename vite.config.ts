import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/nutrition': {
        target: 'https://api.edamam.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nutrition/, '/api/nutrition-data')
      },
      '/api/recipes': {
        target: 'https://api.edamam.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/recipes/, '/api/recipes/v2')
      }
    }
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));