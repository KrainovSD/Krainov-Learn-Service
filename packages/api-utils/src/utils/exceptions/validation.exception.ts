import { HttpException, HttpStatus } from '@nestjs/common'

export type ValidationExceptionMessage = {
  [key: string]: string[]
}

export class ValidationException extends HttpException {
  messages: ValidationExceptionMessage
  constructor(response: ValidationExceptionMessage) {
    super(response, HttpStatus.BAD_REQUEST)
    this.messages = response
  }
}
