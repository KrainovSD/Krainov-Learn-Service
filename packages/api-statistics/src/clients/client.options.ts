import { ClientsModuleOptions, Transport } from '@nestjs/microservices'
require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.production.env'
      : '.development.env',
})

export function getClientsOptions(
  name: string,
  queue: string | undefined,
): ClientsModuleOptions {
  return [
    {
      name,
      transport: Transport.RMQ,
      options: {
        urls: [
          {
            hostname: process.env.RABBIT_HOST ?? 'localhost',
            port: process.env.RABBIT_PORT
              ? Number(process.env.RABBIT_PORT)
              : 5672,
            protocol: process.env.RABBIT_PROTOCOL ?? 'amqp',
            username: process.env.RABBIT_USER ?? 'guest',
            password: process.env.RABBIT_PASSWORD ?? 'guest',
          },
        ],
        queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  ]
}
