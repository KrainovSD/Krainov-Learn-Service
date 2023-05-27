import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { SETTINGS_DEFAULT } from 'src/const'
import { User } from 'src/users/users.model'

type SettingCreationArgs = {
  userId: number
}

@Table({ tableName: 'settings', createdAt: false, updatedAt: false })
export class Settings extends Model<Settings, SettingCreationArgs> {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number

  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор пользователя',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number

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
