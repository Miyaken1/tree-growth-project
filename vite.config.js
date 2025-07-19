import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tree-growth-project/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        stats: 'stats.html',
        admin: 'admin.html',
      },
    },
  },
});

