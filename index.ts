import { ServerWebSocket } from 'bun';
import * as controller from './src/controller';
import { WebSocketData } from './src/types';

const server = Bun.serve<WebSocketData>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/race") {
      const success = server.upgrade(req, { data: { id: crypto.randomUUID() } });
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    return new Response("Hello world");
  },
  websocket: {
    open: controller.onOpen,
    close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
      const data = controller.onClose(ws, code, reason);
      if (data) {
        ws.unsubscribe('race');
        server.publish('race', JSON.stringify(data));
      }
    },
    message: controller.onMessage,
  },
});

console.log(`Listening on localhost:${server.port}`);