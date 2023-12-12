import { WsException } from '@nestjs/websockets'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Type,
  mixin,
} from '@nestjs/common'
import { ClientService } from '../../clients/client.service'
import { typings } from '@krainov/kls-utils'
import { uuid } from '../helpers'

type AuthGuardOptions = {
  roles?: string[] | string
  subscription?: boolean
}

export function WsAuthGuard(options?: AuthGuardOptions) {
  class AuthGuardClass implements CanActivate {
    constructor(
      @Inject(ClientService) private readonly clientService: ClientService,
    ) {}

    private checkRole(requiredRoles: string | string[], currentRole: string) {
      if (typings.isArray(requiredRoles)) {
        return requiredRoles.length === 0
          ? true
          : requiredRoles.some((role) => role === currentRole)
      } else if (typings.isString(requiredRoles)) {
        return requiredRoles === currentRole
      }
      return true
    }

    private checkSubscription(subscription: Date | null) {
      if (!subscription) return false
      const now = new Date()
      const subscriptionDate = new Date(subscription)
      return subscriptionDate > now
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const requiredRoles = options?.roles
        const isRequiredSub = options?.subscription
        const client = context.switchToWs().getClient<Client>()

        if (!client.traceId) {
          client.traceId = uuid()
        }

        if (!client.user) {
          throw new ForbiddenException()
        }

        if (requiredRoles && !this.checkRole(requiredRoles, client.user.role)) {
          throw new ForbiddenException()
        }
        if (
          isRequiredSub &&
          !this.checkSubscription(client.user.subscription)
        ) {
          throw new ForbiddenException()
        }

        return true
      } catch (e: unknown) {
        throw new WsException({
          status: 1008,
          message: 'Required Authorization',
        })
      }
    }
  }
  const Guard = mixin(AuthGuardClass)
  return Guard as Type<CanActivate>
}
