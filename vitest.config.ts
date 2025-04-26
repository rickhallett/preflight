import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path' // Import path module

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Set the test environment to jsdom
    setupFiles: './tests/setup.ts', // Specify setup file
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Add path alias configuration
    },
  },
}) 