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

  interface StreakInfo {
    knownNormal: boolean
    knownReverse: boolean
    learnNormal: boolean
    learnReverse: boolean
    repeatNormal: boolean
    repeatReverse: boolean
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFileName: string
    traceId: string
    user: UserInfo
  }
}
