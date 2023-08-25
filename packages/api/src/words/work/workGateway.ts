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
import { WorkKind, WorkService, WorkType } from './work.service'
import { StartWorkDro } from './dto/start.dto'
import { UsePipes } from '@nestjs/common'
import { WSValidationPipe } from 'src/utils/pipes/wsValidation.pipe'
import { AuthWorkDto } from './dto/auth.dto'
import { UserInfo } from 'src/auth/auth.service'
import { WordsWorkDro } from './dto/words.dto'

export type Client = {
  user?: UserInfo
  id?: string
  type?: WorkType
  kind?: WorkKind
} & Record<string, any>

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

  afterInit(server: Server): void {}

  handleConnection(client: Client) {}

  handleDisconnect(client: Client) {}

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('auth')
  async authWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: AuthWorkDto,
  ) {
    const user = this.workService.getUserInfoFromClient(dto)
    if (user) {
      client.user = user
      this.workService.sendTargetMessage(client, 'auth', 'successfull connect')
      return
    }
    this.workService.closeClientConnection(1008, 'no auth', client)
  }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('start')
  async startWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: StartWorkDro,
  ) {
    if (!this.workService.validateMessage(client, dto)) return

    await this.workService.startWork(client, dto)
  }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('words')
  async wordsWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: WordsWorkDro,
  ) {
    if (!this.workService.validateMessage(client, dto)) return
  }
}
