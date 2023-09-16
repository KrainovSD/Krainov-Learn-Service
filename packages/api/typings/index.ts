import { UserInfo } from 'src/auth/auth.service'

export {}

declare global {
  namespace Storage {
    interface MultipartFile {
      toBuffer: () => Promise<Buffer>
      file: NodeJS.ReadableStream
      fieldname: string
      filename: string
      encoding: string
      mimetype: string
      fields: import('@fastify/multipart').MultipartFields
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFileName: string
    traceId: string
    user: UserInfo
  }
}
