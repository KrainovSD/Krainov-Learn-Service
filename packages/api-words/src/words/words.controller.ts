import { Controller } from '@nestjs/common'
import { WordsService } from './words.service'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'
import { GetStreakMessageDto } from './dto/get-streak-message.dto'
import { DeleteWordsEventDto } from './dto/delete-word-event.dto'

@Controller()
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @MessagePattern('get_streak')
  getStreak(@Payload() dto: GetStreakMessageDto) {
    return this.wordsService.checkStreak(dto.data.userId, dto.traceId)
  }

  @EventPattern('delete_words')
  async deleteWords(@Payload() dto: DeleteWordsEventDto) {
    await this.wordsService.deleteAllUsersInstance(
      dto.data.userIds,
      dto.traceId,
    )
  }
}
