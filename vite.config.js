import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so this works on both a user page
// (winxon.github.io) and a project page (winxon.github.io/personal-website).
export default defineConfig({
  base: './',
  plugins: [react()],
})
