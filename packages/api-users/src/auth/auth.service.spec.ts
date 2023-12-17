import { Test } from '@nestjs/testing'
import { Provider } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ERROR_MESSAGES } from '../const'
import { JwtModule } from '../jwt/jwt.module'
import { AuthService } from './auth.service'
import { ConfirmDto } from './dto/confirm.dto'
import { UsersService } from '../users/users.service'
import { utils } from '@krainov/kls-utils'

describe('Auth Service', () => {
  let authService: AuthService
  let usersService: UsersService

  const mailerProvider: Provider = {
    provide: MailerService,
    useValue: {
      sendMail: jest.fn(() => null),
    },
  }
  const userProvider: Provider = {
    provide: UsersService,
    useValue: {
      checkUniqueEmail: jest.fn(() => null),
      checkUniqueNickName: jest.fn(() => null),
      createUser: jest.fn(() => null),
      getUserByEmailChangeKey: jest.fn(() => null),
      getUserByEmailOrNickName: jest.fn(() => null),
      getUserByTokenAndId: jest.fn(() => null),
    },
  }

  beforeEach(async () => {
    const authModuleRef = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [AuthService, mailerProvider, userProvider],
    }).compile()

    authService = authModuleRef.get<AuthService>(AuthService)
    usersService = authModuleRef.get<UsersService>(UsersService)
  })

  describe('confirm', () => {
    let confirmDto: ConfirmDto
    let traceId: string

    beforeAll(() => {
      confirmDto = { key: '0' }
      traceId = '0'
    })

    it('bad key', async () => {
      jest
        .spyOn(usersService, 'getUserByEmailChangeKey')
        .mockReturnValue(false as any)
      await expect(
        authService.confirm(confirmDto, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime)
    })
    it('email change time has expired', async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockReturnValue({
        emailChangeTime: utils.date.getDate(-1, 'minutes'),
      } as any)
      await expect(
        authService.confirm(confirmDto, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime)
    })
    it(`haven't email to change`, async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockReturnValue({
        emailChangeTime: utils.date.getDate(2, 'minutes'),
      } as any)
      await expect(
        authService.confirm(confirmDto, traceId),
      ).rejects.toThrowError(ERROR_MESSAGES.badKeyOrTime)
    })
    it(`success`, async () => {
      jest.spyOn(usersService, 'getUserByEmailChangeKey').mockReturnValue({
        emailChangeTime: utils.date.getDate(2, 'minutes'),
        emailToChange: 'test@gmail.com',
        save: () => null,
      } as any)
      await expect(
        authService.confirm(confirmDto, traceId),
      ).resolves.toBeTruthy()
    })
  })
})
