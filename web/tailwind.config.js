/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // 极简优雅字体系统
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '-0.011em' }],
        'sm': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
        'base': ['1.0625rem', { lineHeight: '1.75', letterSpacing: '-0.011em' }],
        'lg': ['1.25rem', { lineHeight: '1.75', letterSpacing: '-0.015em' }],
        'xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
        '2xl': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
        '3xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
      },
      // 优雅间距系统
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // 轻柔阴影系统
      boxShadow: {
        'elegant-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'elegant-md': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'elegant-lg': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'elegant-xl': '0 16px 48px rgba(0, 0, 0, 0.10), 0 8px 16px rgba(0, 0, 0, 0.05)',
      },
      // 高斯模糊
      backdropBlur: {
        'xs': '4px',
        'elegant': '16px',
        'elegant-strong': '24px',
      },
      // 优雅圆角
      borderRadius: {
        'elegant': '1.25rem',
        'elegant-lg': '1.5rem',
        'elegant-xl': '2rem',
      },
      // 流畅过渡
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

