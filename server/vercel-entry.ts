import { createApiExpress } from './app.ts';

const app = createApiExpress();

export default function handler(req: unknown, res: unknown) {
  return (app as (request: unknown, response: unknown) => unknown)(req, res);
}
