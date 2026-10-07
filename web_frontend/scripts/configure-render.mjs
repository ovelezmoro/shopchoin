import { writeFileSync } from 'node:fs';

const value = process.env.API_URL?.trim();
if (!value) {
  throw new Error('Configura API_URL: https://TU-BACKEND.onrender.com/shopchain/api');
}

const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
    url.pathname.replace(/\/+$/, '') !== '/shopchain/api') {
  throw new Error('API_URL debe ser HTTPS y terminar en /shopchain/api, sin credenciales, query ni fragmento.');
}

writeFileSync(
  new URL('../src/environments/environment.render.ts', import.meta.url),
  `// Generado por scripts/configure-render.mjs\nexport const environment = ${JSON.stringify({
    production: true,
    apiUrl: url.href.replace(/\/+$/, ''),
  })};\n`,
);
