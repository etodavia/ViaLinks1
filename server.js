import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

console.log('[Entry] Starting root server.js...');
console.log('[Entry] Current working directory:', process.cwd());

async function start() {
  const distPath = path.join(__dirname, 'dist');
  const serverPath = path.join(distPath, 'server.js');

  if (!fs.existsSync(distPath)) {
    console.error('[Entry] ERROR: The "dist" folder is missing! Run "npm run build".');
    serveDiagnostic(`ERRO: A pasta "dist" não existe. Você precisa rodar o comando de build.`);
    return;
  }

  if (!fs.existsSync(serverPath)) {
    console.error('[Entry] ERROR: "dist/server.js" is missing! Run "npm run build".');
    serveDiagnostic(`ERRO: O arquivo "dist/server.js" não existe dentro da pasta dist.`);
    return;
  }

  try {
    console.log('[Entry] Attempting to import:', serverPath);
    await import('./dist/server.js');
    console.log('[Entry] Successfully imported dist/server.js');
  } catch (error) {
    console.error('[Entry] FATAL ERROR during import:', error);
    serveDiagnostic(`ERRO FATAL AO INICIAR: ${error.message}\n\n${error.stack}`);
  }
}

function serveDiagnostic(message) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html>
        <body style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h1 style="color: #e53e3e;">Diagnóstico de Inicialização</h1>
          <p>O servidor principal não pôde ser iniciado. Detalhes:</p>
          <pre style="background: #f7fafc; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">${message}</pre>
          <hr>
          <p><strong>Dica:</strong> Verifique se você rodou <code>npm run build</code> no painel da Hostinger.</p>
          <p>Pasta atual: <code>${process.cwd()}</code></p>
        </body>
      </html>
    `);
  });
  server.listen(PORT, () => {
    console.log(`[Diagnostic] Diagnostic server running on port ${PORT}`);
  });
}

start();
