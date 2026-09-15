import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { createApiExpress } from './server/app.ts';

const apiApp = createApiExpress();

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'reoxy-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/api')) {
              next();
              return;
            }
            apiApp(req as never, res as never, next);
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
