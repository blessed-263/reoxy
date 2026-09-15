import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'reoxy-api',
        async configureServer(server) {
          const { createApiExpress } = await import('./server/app.ts');
          const apiApp = createApiExpress();
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
