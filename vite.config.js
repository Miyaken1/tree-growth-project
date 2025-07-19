import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // プロジェクトのルートディレクトリ
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        stats: 'stats.html',
        admin: 'admin.html'
      }
    }
  },
  server: { port: 5173 },
});

