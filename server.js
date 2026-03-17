import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('[Entry] Starting root server.js...');
console.log('[Entry] Current working directory:', process.cwd());
console.log('[Entry] NODE_ENV:', process.env.NODE_ENV);
console.log('[Entry] PORT env:', process.env.PORT);

async function start() {
  try {
    const serverPath = path.join(__dirname, 'dist', 'server.js');
    console.log('[Entry] Attempting to import:', serverPath);
    await import('./dist/server.js');
    console.log('[Entry] Successfully imported and started dist/server.js');
  } catch (error) {
    console.error('[Entry] FATAL ERROR during startup:', error);
    process.exit(1);
  }
}

start();
