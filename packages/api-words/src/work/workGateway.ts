import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets'
import { Server } from 'ws'
import { WorkService } from './work.service'
import { StartWorkDto } from './dto/start.dto'
import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common'
import { AuthWorkDto } from './dto/auth.dto'
import { WordsWorkDro } from './dto/words.dto'
import { RestoreWorkDto } from './dto/restore.dto'
import { TraceId, WSValidationPipe, logger, uuid } from '../utils'
import { WsAuthGuard } from '../utils/guards/ws-auth.guard'

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

  async handleDisconnect(client: Client) {
    await this.workService.handleDisconnect(client)
  }

  @UsePipes(WSValidationPipe)
  @SubscribeMessage('auth')
  @UseInterceptors(logger.LoggerInterceptor)
  @UseFilters(logger.LoggerFilter)
  async authWork(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: AuthWorkDto,
  ) {
    return this.workService.getUserInfoFromClient(dto, client)
  }

  @UsePipes(WSValidationPipe)
  @UseGuards(WsAuthGuard())
  @UseInterceptors(logger.LoggerInterceptor)
  @UseFilters(logger.LoggerFilter)
  @SubscribeMessage('start')
  async startSession(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: StartWorkDto,
  ) {
    return this.workService.startSession(client, dto)
  }

  @UsePipes(WSValidationPipe)
  @UseGuards(WsAuthGuard())
  @UseInterceptors(logger.LoggerInterceptor)
  @UseFilters(logger.LoggerFilter)
  @SubscribeMessage('words')
  async checkWord(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: WordsWorkDro,
  ) {
    return this.workService.checkWord(client, dto)
  }

  @UseGuards(WsAuthGuard())
  @UseInterceptors(logger.LoggerInterceptor)
  @UseFilters(logger.LoggerFilter)
  @SubscribeMessage('next')
  async wordsNext(@ConnectedSocket() client: Client) {
    return this.workService.defineNextWord(client)
  }

  @UsePipes(WSValidationPipe)
  @UseGuards(WsAuthGuard())
  @UseInterceptors(logger.LoggerInterceptor)
  @UseFilters(logger.LoggerFilter)
  @SubscribeMessage('restore')
  async restoreSession(
    @ConnectedSocket() client: Client,
    @MessageBody() dto: RestoreWorkDto,
  ) {
    return this.workService.restoreSession(client, dto)
  }
}
