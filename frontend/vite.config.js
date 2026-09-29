import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    //5173 Windows ki reserved port range (5144-5243) me aata hai isliye EACCES deta hai,
    //isliye us range ke bahar ka fixed port use kar rahe hain
    port: 3000,
    strictPort: false,
    host: "127.0.0.1",
  },
})
