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
    try {
      const user = this.workService.getUserInfoFromClient(dto)
      if (user) {
        client.user = user
        this.workService.sendTargetMessage(
          client,
          'auth',
          'successfull connect',
        )
        return
      }
      this.workService.closeClientConnection(1008, 'no auth', client)
    } catch (error) {
      this.workService.sendTargetMessage(client, 'error', error)
    }
  }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('start')
  async startWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: StartWorkDro,
  ) {
    try {
      if (!this.workService.validateMessage(client, dto)) return
      await this.workService.startWork(client, dto)
    } catch (error) {
      console.log(error)
      this.workService.sendTargetMessage(client, 'error', error)
    }
  }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('words')
  async wordsWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: WordsWorkDro,
  ) {
    try {
      if (!this.workService.validateMessage(client, dto, true)) return
      await this.workService.wordsWork(client, dto)
    } catch (error) {
      this.workService.sendTargetMessage(client, 'error', error)
    }
  }

  @SubscribeMessage('next')
  async wordsNext(@ConnectedSocket() client: Client) {
    try {
      if (!this.workService.validateClient(client, true)) return
      await this.workService.wordsNext(client)
    } catch (error) {
      this.workService.sendTargetMessage(client, 'error', error)
    }
  }
}
