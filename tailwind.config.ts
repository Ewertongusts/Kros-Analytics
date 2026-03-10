import type { Config } from 'tailwindcss'

export default {
    darkMode: 'class',
    content: [
        './app/**/*.{js,vue,ts}',
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                inter: ['Inter', 'sans-serif']
            },
            colors: {
                'kros-main': '#FFFFFF',
                'kros-surface': '#F8FAFC',
                'kros-blue': 'var(--kros-blue, #007BFF)',
                'kros-text': '#0F172A',
                'kros-outline': '#E2E8F0',
            },
            boxShadow: {
                'kros-soft': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
            }
        }
    },
    plugins: []
} satisfies Config
