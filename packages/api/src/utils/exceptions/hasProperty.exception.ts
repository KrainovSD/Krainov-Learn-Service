import { HttpException, HttpStatus } from '@nestjs/common'
export class HasPropertyException extends HttpException {
  constructor(response: string) {
    super(response, HttpStatus.BAD_REQUEST)
    this.message = `Указанный вами ${response.trim()} уже используется другим пользователем`
  }
}
