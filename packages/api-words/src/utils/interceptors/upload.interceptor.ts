import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  mixin,
  Type,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { TRequest } from 'src/auth/auth.service'
import { uuid } from '../helpers'
import { checkOrCreateFolder } from '../helpers/fsOperation'
import { writeFile } from 'fs/promises'

type TUploadInterceptor = {
  fieldName: string
  mimeTypes: RegExp
  limits: number
  pathToSave: string
}

export function UploadInterceptor({
  fieldName,
  limits,
  mimeTypes,
  pathToSave,
}: TUploadInterceptor) {
  class UploadInterceptorClass implements NestInterceptor {
    constructor() {}

    async intercept(
      ctx: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      if (!fieldName) throw new BadRequestException('not expected field')

      const req = ctx.switchToHttp().getRequest() as TRequest
      const isMultipart = req.isMultipart()
      if (!isMultipart)
        throw new BadRequestException('multipart/form-data expected.')

      const file = await req.file({
        limits: {
          fileSize: limits,
        },
      })
      if (!file) throw new BadRequestException('file expected')
      if (fieldName.toLowerCase() !== file.fieldname.toLowerCase())
        throw new BadRequestException('current field not expected')
      if (!mimeTypes.test(file.mimetype))
        throw new BadRequestException('not expected mimetype')

      const buffer = await file.toBuffer()
      const fileName = `${uuid()}.${file.filename.split('.').pop()}`

      await checkOrCreateFolder(pathToSave)
      await writeFile(`${pathToSave}/${fileName}`, buffer, 'binary')

      req.incomingFileName = fileName
      return next.handle()
    }
  }
  const Interceptor = mixin(UploadInterceptorClass)
  return Interceptor as Type<NestInterceptor>
}
