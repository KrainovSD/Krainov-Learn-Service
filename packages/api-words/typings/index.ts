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
  interface UserInfo {
    id: string
    role: string
    subscription: Date | null
  }
  interface UserSettings {
    id: string
    userId: string
    knownWordsCount: number
    mistakesInWordsCount: number
    repeatWordsRegularity: number[]
    relevanceObserveDay: number
    relevanceObserveCount: number
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFileName: string
    traceId: string
    user: UserInfo
  }
}
