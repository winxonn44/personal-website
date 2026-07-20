/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        surface: '#141417',
        line: '#26262b',
        bone: '#EDEAE3',
        muted: '#6E6E77',
        amber: '#F0A227',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: { content: '1180px' },
    },
  },
  plugins: [],
}
