import type { IncomingMessage, ServerResponse } from 'http';
import { createApiExpress } from '../server/app.ts';

const app = createApiExpress();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (typeof req.url === 'string' && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
  }
  app(req as never, res as never);
}
