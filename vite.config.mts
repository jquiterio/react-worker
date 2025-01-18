import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ['src'] })],
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
})
