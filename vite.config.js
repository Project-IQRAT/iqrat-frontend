import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Rolldown requires this to be a function, not an object!
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three'; // Puts Three.js in its own file
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor'; // Puts React core libraries in their own file
          }
        }
      }
    }
  }
})