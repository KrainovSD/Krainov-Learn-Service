import { SetMetadata } from '@nestjs/common'
import { ROLE_DECORATOR_KEY } from 'src/const'

export const Role = (role: string) => SetMetadata(ROLE_DECORATOR_KEY, role)
