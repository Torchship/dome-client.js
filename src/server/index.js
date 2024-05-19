// /my-app/server.js

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { connection } from './socket.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve the static files from the Vite build
app.use(express.static(join(__dirname, 'dist')));

wss.on('connection', connection);

// Fallback to serve index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => server.close());
}
