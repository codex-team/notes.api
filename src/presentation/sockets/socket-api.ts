import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { DomainServices } from "@domain/index.ts";

export default class SocketApi {
  private wss: any | undefined;
  private server: http.Server;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.server = http.createServer();
  }

  public async init(domainServices: DomainServices): Promise<void> {
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on("connection", (ws: WebSocket) => {
      ws.on("message", (message: string) => {
        ws.send(`Echo: ${message}`);//TODO: note.ts route
      });

      ws.on("close", () => {});

      ws.on("error", (error) => {});
    });

    const { host, port } = this.config;
    this.server.listen(port, host, () => {
      console.log(`WebSocket server running at ws://${host}:${port}`);
    });
  }
}
