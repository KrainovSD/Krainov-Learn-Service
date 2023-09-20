import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  HasOne,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { Settings } from 'src/settings/settings.model'

export interface UserCreationArgs {
  id: string
  userName: string
  nickName: string
  hash: string
  registrationDate: Date
  emailChangeKey: string
  emailChangeTime: Date
  emailToChange: string
}

@Table({ tableName: 'users', createdAt: false, updatedAt: false })
export class User extends Model<User, UserCreationArgs> {
  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Уникальный идентификатор',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
    unique: true,
    primaryKey: true,
    allowNull: false,
  })
  id!: string

  @ApiProperty({ example: 'Денис', description: 'Имя пользователя' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userName!: string

  @ApiProperty({ example: 'Krainov', description: 'Псевдоним пользователя' })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  nickName!: string

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Адресс электронной почты пользователя',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    defaultValue: null,
    allowNull: true,
  })
  email!: string | null

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hash!: string

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя в системе',
  })
  @Column({
    type: DataType.STRING,
    defaultValue: 'user',
    allowNull: false,
  })
  role!: string

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата окончания подписки',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  subscription!: Date | null

  @ApiProperty({
    example: 'example.png',
    description: 'Название аватара пользователя в хранилище',
  })
  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    allowNull: true,
  })
  avatar!: string | null

  @ApiProperty({
    example: 'example.png',
    description: 'Название обоев пользователя в хранилище',
  })
  @Column({
    type: DataType.TEXT,
    defaultValue: null,
    allowNull: true,
  })
  wallpaper!: string | null

  @ApiProperty({
    example: 'true',
    description: 'Статус подтверждения аккаунта',
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  confirmed!: boolean

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkcyJ9.FzPrrFubBGlttQS1s27dzvgKvNeLRVqQjqKlMVhx02I',
    description: 'Токен авторизации',
  })
  @Column({
    type: DataType.STRING,
    defaultValue: null,
    allowNull: true,
  })
  token!: string | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего посещения',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastLogin!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата регистрации',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  registrationDate!: Date

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последней смены пароля',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  passwordChangeDate!: Date | null

  @ApiProperty({
    example: 'datgjmdsanjqwnjncandjxadn',
    description: 'Уникальный ключ для смены пароля',
  })
  @Column({
    type: DataType.STRING,
    defaultValue: null,
    allowNull: true,
  })
  passwordChangeKey!: string | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Время до конца операции смены пароля',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  passwordChangeTime!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последней смены адреса электронной почты',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  emailChangeDate!: Date | null

  @ApiProperty({
    example: 'datgjmdsanjqwnjncandjxadn',
    description: 'Уникальный ключ для смены адреса электронной почты',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailChangeKey!: string | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Время до конца операции смены адреса электронной почты',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailChangeTime!: Date | null

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Неподтвержденный адрес электронной почты',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailToChange!: string | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последней смены псевдонима пользователя',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  nickNameChangeDate!: Date | null

  @HasOne(() => Settings, { onDelete: 'CASCADE' })
  settings!: Settings
}
