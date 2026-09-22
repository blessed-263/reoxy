import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/vercel-entry.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'api/index.js',
  packages: 'external',
  logLevel: 'info',
});
