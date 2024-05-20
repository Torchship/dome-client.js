// /my-app/server.js

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connection } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const corsPolicy = {
  origin: "*",
  methods: ["GET", "POST"],
};

const httpOptions = {
  cors: corsPolicy,
};

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, httpOptions);

// Serve the static files from the Vite build
app.use(cors(corsPolicy));
// app.use(express.static(join(__dirname, 'dist')));

// Handle socket.io connections
io.on('connection', connection);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => server.close());
}
