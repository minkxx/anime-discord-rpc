import { Client } from '@xhayper/discord-rpc';
import { WebSocketServer } from 'ws';

const clientId = '1526911509878538340';
const rpc = new Client({ clientId });

rpc.on('ready', () => {
  console.log('Connected to Discord desktop client!');
});

rpc.login().catch(console.error);

const wss = new WebSocketServer({ port: 8080 });

console.log('RPC Server started! Listening on ws://127.0.0.1:8080');

wss.on('connection', (ws) => {
  console.log('Browser extension connected!');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'STOPPED') {
        rpc.user?.clearActivity();
        console.log('Anime playback stopped. Cleared RPC status.');
        return;
      }

      if (data.type === 'WATCHING' || data.type === 'PAUSED') {
        
        const now = Date.now();
        const startTimestamp = new Date(now - data.currentMs);
        const endTimestamp = new Date(startTimestamp.getTime() + data.durationMs);

        rpc.user?.setActivity({
          type: 3,
          details: data.title,
          state: data.type === 'PAUSED' ? `Paused - ${data.episode}` : data.episode,
          
          largeImageKey: data.coverUrl,
          largeImageText: data.title,
          
          startTimestamp: data.type === 'WATCHING' ? startTimestamp : undefined,
          endTimestamp: data.type === 'WATCHING' ? endTimestamp : undefined,
          
        }).then(() => {
          console.log(`RPC Updated: [${data.type}] ${data.title} - ${data.episode}`);
        }).catch((err) => {
          console.error('Failed to update Discord activity:', err);
        });
      }
    } catch (error) {
      console.error('Failed to parse incoming WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Browser extension disconnected. Clearing RPC.');
    rpc.user?.clearActivity();
  });
});
