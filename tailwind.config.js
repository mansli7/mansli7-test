/** @type {import('tailwindcss').Config} */
// Mirrors the old cdn.tailwindcss.com config (v3 semantics, preflight disabled).
module.exports = {
  content: [
    './**/*.{html,md,js}',
    '!./_site/**',
    '!./node_modules/**',
  ],
  // Classes toggled in JS or referenced only in compound selectors (inline <style>
  // card-* gating) that the scanner might otherwise miss.
  safelist: ['hidden', 'block', 'flex', 'grid', 'inline-block', 'inline-flex'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
      },
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto',
          'Helvetica Neue', 'Arial', 'PingFang TC', 'Hiragino Sans GB',
          'Microsoft YaHei New', 'Microsoft Yahei', 'SimHei', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
