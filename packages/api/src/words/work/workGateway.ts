import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server } from 'ws'
import { WorkService } from './work.service'
import { StartWorkDro } from './dto/start.work.dto'
import { UsePipes } from '@nestjs/common'
import { WSValidationPipe } from 'src/utils/pipes/wsValidation.pipe'

@WebSocketGateway({
  cors: {
    origin: ['*'],
    credentials: true,
  },
  path: '/word',
})
export class WorkGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly workService: WorkService) {}

  @WebSocketServer()
  server!: Server

  afterInit(server: Server): void {
    server.on('connection', (client: any, request: Request) => {
      client.req = request
    })
  }

  handleConnection(client: any) {
    const user = this.workService.getUserInfoFromClient(client)
    if (!user) this.workService.closeClientConnection(1008, 'no auth', client)
    client.user = user
  }

  handleDisconnect(client: any) {
    console.log(client.user)
    //this.broadcast('disconnect', {})
  }

  // @SubscribeMessage('test')
  // onChgEvent(client: any, payload: any) {
  //   console.log(client.user)
  //   console.log(payload)
  // }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('start')
  async startWork(
    @ConnectedSocket() client: any,
    @MessageBody() dto: StartWorkDro,
  ) {
    if (!dto)
      this.workService.sendTargetMessage(client, 'bad_request', {
        message: 'bad request',
      })
    await this.workService.startWork(client, dto)
  }
}
