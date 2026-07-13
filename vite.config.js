import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      theme: path.resolve(__dirname, './src/theme'),
      routes: path.resolve(__dirname, './src/routes'),
      layouts: path.resolve(__dirname, './src/layouts'),
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      services: path.resolve(__dirname, './src/services'),
      assets: path.resolve(__dirname, './src/assets'),
      data: path.resolve(__dirname, './src/data'),
      types: path.resolve(__dirname, './src/types'),
      App: path.resolve(__dirname, './src/App.tsx'),
    }
  }
})
