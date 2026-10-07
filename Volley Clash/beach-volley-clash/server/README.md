# Online relay (optional)

**You almost certainly do not need this.** Online play defaults to a
peer-to-peer transport that needs no server of your own: the two browsers are
introduced by PeerJS's free public broker and then talk directly over WebRTC.
See the *Online play* section of the top-level README.

This relay exists for the cases where you want a server you control — a fixed
address, your own logging, or a network where WebRTC is blocked.

## Switch the game over to it

In `src/config.js`:

```js
export const NET_CONFIG = {
  transport: 'ws',                                   // was 'p2p'
  wsUrl: 'wss://volley-relay.yourdomain.com',
  snapshotHz: 20,
  interpDelay: 0.09,
  // ...
};
```

## Run it locally

```bash
cd server
npm install
npm start          # ws://localhost:8080
```

Open the game in two tabs, go to **Play online**, create a room in one tab and
join with the same code in the other.

## Deploy

Any host that supports Node WebSockets works: Fly.io, Railway, Render, a small
VPS. Serve it over **wss://** — the game is loaded over https on CrazyGames, and
a plain `ws://` connection is blocked as mixed content.

## How the netcode works

The transport changes; the model does not.

- The first peer in a room is the **host**. It runs the authoritative match.
- Everyone sends `{move, jump, spike, serve}` each frame — 4 numbers.
- The host broadcasts a snapshot 20×/second: score, clock, every ball (multiball
  included, with each ball's charged state), every player, and the power system.
- Clients predict their own player and ease towards the host's position, so
  their own input feels instant while everything else stays in sync.
- Empty seats in a 2v2/3v3/4v4 room are filled by the AI on the host.

Because super throws fire on contact rather than on a button, powers need no
separate message: they are already implied by the inputs and confirmed by the
next snapshot.

For a serious launch, move the simulation onto the server so a cheating host
cannot rewrite the score. The `Match` class is deliberately free of DOM and
canvas references, so it can be imported into `server.js` almost as-is.
