// Online play.
//
// Model: one peer in the room is the host. The host runs the authoritative
// simulation and broadcasts snapshots at NET_CONFIG.snapshotHz. Everyone else
// sends only their input each frame, predicts their own player locally, and
// interpolates the rest towards the newest snapshot. Empty seats are AI.
//
// Two transports sit behind the same API:
//
//   p2p (default)  PeerJS. The host claims the peer id `bvclash-<ROOM>` on the
//                  free public broker; guests connect straight to that id and
//                  every packet then travels browser-to-browser over WebRTC.
//                  There is nothing to host and nothing to pay for — the broker
//                  is only used for the introduction, and STUN for NAT
//                  traversal. The host relays guest-to-guest traffic, which is
//                  exactly the star topology the snapshot model already wants.
//
//   ws             The little relay in server/. Self-hosted, useful if you want
//                  a fixed server or the public broker is unreachable.
//
// Switch with NET_CONFIG.transport in src/config.js.

import { NET_CONFIG } from '../config.js';

const roomToPeerId = (room) => NET_CONFIG.peerPrefix + String(room).toUpperCase();

export class NetClient extends EventTarget {
  constructor() {
    super();
    this.transport = NET_CONFIG.transport;
    this.ws = null;
    this.peer = null;
    this.conns = new Map();          // peerId -> DataConnection (host: all guests; guest: just the host)
    this.id = null;
    this.name = 'Player';
    this.room = null;
    this.isHost = false;
    this.peers = [];
    this.latestSnapshot = null;
    this.remoteInputs = new Map();   // peerId -> input
    this.connected = false;
  }

  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  get p2p() { return this.transport === 'p2p'; }

  // ================================================================ connect
  /**
   * For p2p there is no separate "connect" step — the room *is* the
   * connection — so this only validates that the library loaded.
   */
  connect(url = NET_CONFIG.wsUrl) {
    if (this.p2p) {
      if (typeof window.Peer !== 'function') {
        return Promise.reject(new Error('The peer-to-peer library did not load.'));
      }
      this.connected = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try { this.ws = new WebSocket(url); }
      catch (e) { reject(e); return; }

      const timeout = setTimeout(() => reject(new Error('Connection timed out')), 8000);
      this.ws.onopen = () => { clearTimeout(timeout); this.connected = true; resolve(); };
      this.ws.onerror = () => { clearTimeout(timeout); reject(new Error('Could not reach the server')); };
      this.ws.onclose = () => { this.connected = false; this.emit('closed'); };
      this.ws.onmessage = (e) => this.handle(JSON.parse(e.data));
    });
  }

  // =================================================================== join
  join(room, name, teamSize) {
    this.room = String(room).toUpperCase();
    this.name = (name || 'Player').slice(0, 12);
    this.teamSize = teamSize || 1;
    if (this.p2p) return this.joinP2P();
    this.send({ t: 'join', room: this.room, name: this.name, teamSize });
  }

  /**
   * Claim the room's well-known peer id. Winning that race makes you the host;
   * losing it ("ID is taken") means a host already exists, so connect to them.
   * That is the whole matchmaking system, and it costs nothing to run.
   */
  joinP2P() {
    const hostId = roomToPeerId(this.room);
    const opts = {
      config: { iceServers: NET_CONFIG.iceServers },
      debug: 0
    };
    if (NET_CONFIG.peerHost) opts.host = NET_CONFIG.peerHost;

    this.destroyPeer();
    const peer = new window.Peer(hostId, opts);
    this.peer = peer;
    this.pendingGuest = false;

    peer.on('open', (id) => {
      // We own the room id, so we are the host.
      this.id = id;
      this.isHost = true;
      this.connected = true;
      this.peers = [{ id, name: this.name }];
      this.emit('lobby', { peers: this.peers, isHost: true, room: this.room });
    });

    peer.on('connection', (conn) => this.acceptGuest(conn));

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id' && !this.pendingGuest) {
        // Someone got there first — join them instead.
        this.pendingGuest = true;
        this.connectAsGuest(hostId);
        return;
      }
      if (err.type === 'peer-unavailable') {
        this.emit('neterror', 'No room with that code is open right now.');
        return;
      }
      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error') {
        this.emit('neterror', 'Could not reach the matchmaking service. Check your connection.');
        return;
      }
      this.emit('neterror', `Connection problem (${err.type}).`);
    });

    peer.on('disconnected', () => {
      // The broker dropped us; the WebRTC links stay up, but reconnect so new
      // players can still find the room.
      if (!peer.destroyed) { try { peer.reconnect(); } catch { /* gone */ } }
    });
  }

  /** Host side: a new player has arrived. */
  acceptGuest(conn) {
    conn.on('open', () => {
      if (this.peers.length >= NET_CONFIG.maxPeers) {
        conn.send({ t: 'error', message: 'That room is full.' });
        setTimeout(() => conn.close(), 300);
        return;
      }
      this.conns.set(conn.peer, conn);
      const name = (conn.metadata && conn.metadata.name) || 'Player';
      this.peers.push({ id: conn.peer, name });
      conn.send({ t: 'joined', id: conn.peer, room: this.room, isHost: false, peers: this.peers });
      this.broadcastPeers();
      this.emit('lobby', { peers: this.peers, isHost: true, room: this.room });
    });

    conn.on('data', (msg) => this.handle(msg, conn.peer));
    conn.on('close', () => this.dropPeer(conn.peer));
    conn.on('error', () => this.dropPeer(conn.peer));
  }

  /** Guest side: open our own anonymous peer and dial the host. */
  connectAsGuest(hostId) {
    const opts = { config: { iceServers: NET_CONFIG.iceServers }, debug: 0 };
    if (NET_CONFIG.peerHost) opts.host = NET_CONFIG.peerHost;

    this.destroyPeer();
    const peer = new window.Peer(opts);      // broker assigns a random id
    this.peer = peer;
    this.isHost = false;

    peer.on('open', (id) => {
      this.id = id;
      const conn = peer.connect(hostId, {
        reliable: false,                     // unreliable/unordered: this is a game
        metadata: { name: this.name },
        serialization: 'json'
      });
      this.hostConn = conn;
      this.conns.set(hostId, conn);

      const failTimer = setTimeout(() => {
        if (!conn.open) this.emit('neterror', 'The host did not answer. Check the room code.');
      }, 9000);

      conn.on('open', () => { clearTimeout(failTimer); this.connected = true; });
      conn.on('data', (msg) => this.handle(msg, hostId));
      conn.on('close', () => { this.connected = false; this.emit('closed'); });
      conn.on('error', () => this.emit('neterror', 'Lost the link to the host.'));
    });

    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') this.emit('neterror', 'No room with that code is open right now.');
      else this.emit('neterror', `Connection problem (${err.type}).`);
    });
  }

  dropPeer(peerId) {
    this.conns.delete(peerId);
    this.remoteInputs.delete(peerId);
    const before = this.peers.length;
    this.peers = this.peers.filter((p) => p.id !== peerId);
    if (this.isHost && this.peers.length !== before) {
      this.broadcastPeers();
      this.emit('lobby', { peers: this.peers, isHost: true, room: this.room });
    }
  }

  broadcastPeers() {
    this.p2pSend({ t: 'peers', peers: this.peers });
  }

  destroyPeer() {
    if (this.peer && !this.peer.destroyed) { try { this.peer.destroy(); } catch { /* already gone */ } }
    this.peer = null;
    this.conns.clear();
    this.hostConn = null;
  }

  leave() {
    if (this.p2p) {
      this.destroyPeer();
      this.connected = false;
      this.peers = [];
      this.isHost = false;
      return;
    }
    this.send({ t: 'leave' });
    this.ws?.close();
  }

  // ================================================================ sending
  send(obj) {
    if (this.p2p) return this.p2pSend(obj);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  /** Host: fan out to every guest. Guest: forward to the host. */
  p2pSend(obj, exceptId = null) {
    for (const [id, conn] of this.conns) {
      if (id === exceptId) continue;
      if (conn.open) { try { conn.send(obj); } catch { /* dropped packet, next tick */ } }
    }
  }

  startMatch(config) {
    if (this.p2p) {
      const full = { ...config, seats: this.peers.map((p) => ({ id: p.id, name: p.name })) };
      this.p2pSend({ t: 'start', config: full });
      this.emit('start', full);       // the host does not get its own broadcast
      return;
    }
    this.send({ t: 'start', config });
  }

  sendInput(input) {
    // Only the four fields matter; keep the packet tiny.
    const packet = { t: 'in', id: this.id, i: [input.move, input.jump ? 1 : 0, input.spike ? 1 : 0, input.serve ? 1 : 0] };
    if (this.p2p) this.p2pSend(packet);
    else this.send({ t: 'in', i: packet.i });
  }

  sendSnapshot(snap) {
    if (this.p2p) this.p2pSend({ t: 'snap', s: snap });
    else this.send({ t: 'snap', s: snap });
  }

  // =============================================================== receiving
  handle(msg, fromId = null) {
    switch (msg.t) {
      case 'joined':
        this.id = msg.id;
        this.isHost = msg.isHost;
        this.peers = msg.peers;
        this.emit('lobby', { peers: this.peers, isHost: this.isHost, room: msg.room || this.room });
        break;

      case 'peers':
        this.peers = msg.peers;
        if (!this.p2p) this.isHost = msg.peers[0]?.id === this.id;
        this.emit('lobby', { peers: this.peers, isHost: this.isHost, room: this.room });
        break;

      case 'start':
        this.emit('start', msg.config);
        break;

      case 'in': {
        const [move, jump, spike, serve] = msg.i;
        const who = msg.id || fromId;
        this.remoteInputs.set(who, { move, jump: !!jump, spike: !!spike, serve: !!serve });
        // The host is the only one who sees everyone, so it echoes inputs on so
        // that guests can animate each other instead of just their own player.
        if (this.p2p && this.isHost) this.p2pSend(msg, fromId);
        break;
      }

      case 'snap':
        this.latestSnapshot = msg.s;
        break;

      case 'error':
        this.emit('neterror', msg.message);
        break;
    }
  }

  /**
   * Seat assignment: peers fill left team then right team, alternating. The
   * host's own peer list is the authority, and it ships with the start packet
   * so everyone agrees on who is where.
   */
  seatsFor(teamSize, roster = null) {
    const list = roster || this.peers;
    return list.map((peer, index) => ({
      peerId: peer.id,
      name: peer.name,
      team: index % 2,
      slot: Math.floor(index / 2) % teamSize,
      controller: peer.id === this.id ? 'human0' : 'remote'
    }));
  }
}

export const net = new NetClient();
