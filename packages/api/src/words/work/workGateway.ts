import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Server } from 'ws'

@WebSocketGateway({
  cors: {
    origin: ['*'],
    credentials: true,
  },
  path: '/word',
})
export class WorkGateway {
  @WebSocketServer()
  server!: Server

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    console.log(data)
    console.log(client)
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    )
  }

  bindClientConnect(server: Server, callback: () => void) {
    console.log(server)
    server.on('connection', callback)
  }
}
