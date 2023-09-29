import { Controller } from '@nestjs/common'
import { WordsService } from './words.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { GetStreakMessageDto } from './dto/get-streak-message.dto'

@Controller()
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @MessagePattern('get_streak')
  getStreak(@Payload() dto: GetStreakMessageDto) {
    return this.wordsService.checkStreak(dto.data.userId, dto.traceId)
  }
}
