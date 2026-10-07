// Minimal room relay for Beach Volley Clash.
//
// It does not simulate anything. The first peer in a room is the host: it runs
// the authoritative match and broadcasts snapshots, everyone else sends inputs.
// That keeps this server cheap enough to run on a free tier.
//
//   npm install && npm start
//
// Then point NET_CONFIG.url in src/config.js at wss://your-host

import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const MAX_PER_ROOM = 8;
const TICK_TIMEOUT = 30000;

const rooms = new Map();   // roomCode -> { peers: [ {id, name, ws} ], config }
let nextId = 1;

const wss = new WebSocketServer({ port: PORT });
console.log(`Beach Volley Clash relay listening on :${PORT}`);

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

function broadcast(room, obj, exceptId = null) {
  for (const p of room.peers) if (p.id !== exceptId) send(p.ws, obj);
}

function peerList(room) {
  return room.peers.map((p) => ({ id: p.id, name: p.name }));
}

function leaveRoom(ws) {
  const code = ws.roomCode;
  const room = rooms.get(code);
  if (!room) return;
  room.peers = room.peers.filter((p) => p.id !== ws.peerId);
  if (room.peers.length === 0) {
    rooms.delete(code);
    console.log(`room ${code} closed`);
  } else {
    broadcast(room, { t: 'peers', peers: peerList(room) });
  }
  ws.roomCode = null;
}

wss.on('connection', (ws) => {
  ws.peerId = nextId++;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.t) {
      case 'join': {
        const code = String(msg.room || '').toUpperCase().slice(0, 8);
        if (!code) return send(ws, { t: 'error', message: 'Room code required.' });

        let room = rooms.get(code);
        if (!room) {
          room = { peers: [], config: { teamSize: msg.teamSize || 1 } };
          rooms.set(code, room);
        }
        if (room.peers.length >= MAX_PER_ROOM) {
          return send(ws, { t: 'error', message: 'That room is full.' });
        }

        leaveRoom(ws);
        ws.roomCode = code;
        room.peers.push({ id: ws.peerId, name: (msg.name || 'Player').slice(0, 12), ws });

        send(ws, {
          t: 'joined', id: ws.peerId, room: code,
          isHost: room.peers[0].id === ws.peerId,
          peers: peerList(room)
        });
        broadcast(room, { t: 'peers', peers: peerList(room) }, ws.peerId);
        console.log(`peer ${ws.peerId} joined ${code} (${room.peers.length})`);
        break;
      }

      case 'start': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        if (room.peers[0].id !== ws.peerId) return;   // host only
        room.config = msg.config;
        broadcast(room, { t: 'start', config: msg.config });
        break;
      }

      case 'in': {
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        // Inputs only need to reach the host, but relaying to all keeps
        // remote players' animations smooth for everyone.
        broadcast(room, { t: 'in', id: ws.peerId, i: msg.i }, ws.peerId);
        break;
      }

      case 'snap': {
        const room = rooms.get(ws.roomCode);
        if (!room || room.peers[0].id !== ws.peerId) return;
        broadcast(room, { t: 'snap', s: msg.s }, ws.peerId);
        break;
      }

      case 'leave':
        leaveRoom(ws);
        break;
    }
  });

  ws.on('close', () => leaveRoom(ws));
});

// Drop dead sockets so rooms do not fill up with ghosts.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { leaveRoom(ws); ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, TICK_TIMEOUT);
