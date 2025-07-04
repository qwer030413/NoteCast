import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import type { Plugin } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      plugins: [rollupNodePolyFill() as unknown as Plugin],
    },
  },
  plugins: [react(), tailwindcss()],
  base: "/NoteCast/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis', 
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
})
