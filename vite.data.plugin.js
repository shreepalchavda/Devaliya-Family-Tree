import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'src/data/localData.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { families: [], members: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const text = fs.readFileSync(DB_FILE, 'utf-8').trim();
    if (!text) {
      const initial = { families: [], members: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.families)) parsed.families = [];
    if (!Array.isArray(parsed.members)) parsed.members = [];
    return parsed;
  } catch (err) {
    console.error('[local-data-api] Corrupted localData.json, auto-resetting:', err.message);
    const initial = { families: [], members: [] };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  }
}

export function localDataPlugin() {
  return {
    name: 'local-data-api',
    configureServer(server) {
      server.middlewares.use('/api/data', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const data = readDb();
          res.end(JSON.stringify(data));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              if (body) {
                const parsed = JSON.parse(body);
                if (!Array.isArray(parsed.families)) parsed.families = [];
                if (!Array.isArray(parsed.members)) parsed.members = [];
                fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
              }
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    }
  };
}
