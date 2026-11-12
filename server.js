// Revoada — servidor do protótipo
// Telão:   https://SEU-ENDERECO/
// Celular: https://SEU-ENDERECO/c   (aberto pelo QR code do telão)

const express = require('express');
const http = require('http');
const path = require('path');
const QRCode = require('qrcode');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PUBLIC = path.join(__dirname, 'public');
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'screen.html')));
app.get('/c', (req, res) => res.sendFile(path.join(PUBLIC, 'controller.html')));
app.use(express.static(PUBLIC));

// QR code gerado no próprio servidor (o telão não depende de CDN)
app.get('/qr', async (req, res) => {
  try {
    const url = String(req.query.u || '').slice(0, 500);
    const png = await QRCode.toBuffer(url, { width: 480, margin: 1 });
    res.type('png').send(png);
  } catch (e) {
    res.status(400).end();
  }
});

const COLORS = ['#ff4d4d', '#3d8bff', '#ffc531', '#2ecc71', '#b06cff', '#ff8c42', '#20c9b8', '#ff5fae'];
const players = {};
let colorIdx = 0;
let gameState = { state: 'lobby' };

io.on('connection', (s) => {
  // O telão se identifica
  s.on('screen', () => {
    s.join('screens');
    s.emit('players', Object.values(players));
  });

  // Celular entra no jogo
  s.on('join', (name) => {
    const clean = String(name || '').replace(/[<>]/g, '').trim().slice(0, 12) || 'Jogador';
    const p = { id: s.id, name: clean, color: COLORS[colorIdx++ % COLORS.length] };
    players[s.id] = p;
    s.join('controllers');
    s.emit('joined', p);
    s.emit('state', gameState);
    io.to('screens').emit('playerJoined', p);
  });

  // Mira (alta frequência: "volatile" descarta pacotes atrasados em vez de enfileirar)
  s.on('aim', (a) => {
    if (!players[s.id] || !a) return;
    io.to('screens').volatile.emit('aim', { id: s.id, x: +a.x, y: +a.y });
  });

  s.on('shoot', (a) => {
    if (!players[s.id] || !a) return;
    io.to('screens').emit('shoot', { id: s.id, x: +a.x, y: +a.y });
  });

  // Telão → celular: acertou/errou
  s.on('result', (r) => {
    if (r && r.id) io.to(r.id).emit('result', r);
  });

  // Telão → todos os celulares: início/fim de partida
  s.on('state', (st) => {
    gameState = st || { state: 'lobby' };
    io.to('controllers').emit('state', gameState);
  });

  s.on('disconnect', () => {
    if (players[s.id]) {
      delete players[s.id];
      io.to('screens').emit('playerLeft', s.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Revoada rodando em http://localhost:${PORT}`);
  console.log('Para os celulares funcionarem, exponha via HTTPS (veja o README).');
});
