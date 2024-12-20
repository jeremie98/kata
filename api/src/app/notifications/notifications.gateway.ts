import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private connectedClients: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.connectedClients.set(client.id, userId);
      console.log(`Client connected: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(userId: string, message: string) {
    for (const [clientId, id] of this.connectedClients.entries()) {
      if (id === userId) {
        this.server.to(clientId).emit('notification', { message });
      }
    }
  }
}
