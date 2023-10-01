export {}

export interface Client extends Record<string, any> {
  user?: UserInfo
  id?: string
  traceId?: string
}

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
  interface UserInfo {
    id: string
    role: string
    subscription: Date | null
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFileName: string
    traceId: string
    user: UserInfo
  }
}
