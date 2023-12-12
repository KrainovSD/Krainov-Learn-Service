import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { User } from '../users/users.model'
import { SETTINGS_DEFAULT } from './settings.constants'

type SettingCreationArgs = {
  id: string
  userId: string
}

@Table({ tableName: 'settings', createdAt: false, updatedAt: false })
export class Settings extends Model<Settings, SettingCreationArgs> {
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

  @ApiProperty({
    example: '3850de1c-6b55-47e5-817f-bd02aaa69cf9',
    description: 'Уникальный идентификатор пользователя',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string

  @ApiProperty({
    example: 50,
    description: 'Количество изученных слов для одного повторения',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: SETTINGS_DEFAULT.knownWordsCount,
    allowNull: false,
  })
  knownWordsCount!: number

  @ApiProperty({
    example: 3,
    description:
      'Количество допустимых в слове ошибок в течении всего времени для добавления на повторение',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: SETTINGS_DEFAULT.mistakesInWordsCount,
    allowNull: false,
  })
  mistakesInWordsCount!: number

  @ApiProperty({
    example: [2, 2, 2, 4, 4, 4, 8, 8],
    description:
      'Регулярность повторения слов с ошибками (интервал между повторениями)',
  })
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    defaultValue: SETTINGS_DEFAULT.repeatWordsRegularity,
    allowNull: false,
  })
  repeatWordsRegularity!: number[]

  @ApiProperty({
    example: 45,
    description:
      'Промежуток дней, за который высчитывается количество встреч со словом',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: SETTINGS_DEFAULT.relevanceObserveDay,
    allowNull: false,
  })
  relevanceObserveDay!: number

  @ApiProperty({
    example: 3,
    description:
      'Количество встреч со словом, которое высчитывается за промежуток дней',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: SETTINGS_DEFAULT.relevanceObserveCount,
    allowNull: false,
  })
  relevanceObserveCount!: number
}
