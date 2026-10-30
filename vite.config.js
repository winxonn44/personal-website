import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build stamp (DESIGN-v2 F5): short git hash + build date, shown in the
// footer. Falls back to "dev" when git isn't available.
function gitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || 'dev'
  } catch {
    return 'dev'
  }
}
const buildDate = new Date()
  .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  .replace(',', '')
  .toUpperCase() // "OCT 29 2026"

// base: './' keeps asset paths relative so this works on both a user page
// (winxon.github.io) and a project page (winxon.github.io/personal-website).
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __BUILD_HASH__: JSON.stringify(gitHash()),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
})
