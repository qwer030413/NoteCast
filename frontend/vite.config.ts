import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
  base: "/NoteCast/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
