import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({ fastRefresh: true })],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../web-dist',
    emptyOutDir: true,
    // 优化: 代码分割配置
    rollupOptions: {
      output: {
        // 代码分割优化
        manualChunks: {
          // React 核心库
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 状态管理和数据请求
          'vendor-state': ['zustand', '@tanstack/react-query'],
          // 图表库
          'vendor-chart': ['echarts', 'echarts-for-react', 'chart.js'],
          // 编辑器
          'vendor-editor': ['monaco-editor', '@monaco-editor/react'],
        },
        // 优化: 文件名包含 hash
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // 优化: 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.info'], // 移除特定函数调用
      },
    },
    // 优化: chunk 大小警告阈值
    chunkSizeWarningLimit: 1000, // 提高到 1000KB
    // 优化: 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化: 源码映射（生产环境可以禁用以减小体积）
    sourcemap: false,
    // 优化: 目标浏览器
    target: 'es2015',
  },
  server: {
    port: 5173,
    // 优化: 开发服务器配置
    hmr: {
      overlay: true, // 显示错误覆盖层
    },
    // 优化: 预构建优化
    fs: {
      strict: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  // 优化: 依赖预构建优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'echarts',
      'echarts-for-react',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
  },
  // 优化: esbuild 配置
  esbuild: {
    // 生产环境移除 console 和 debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
