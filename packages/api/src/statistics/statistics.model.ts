import { User } from './../users/users.model'
import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'

type StatisticCreationArgs = {
  userId: number
}

@Table({ tableName: 'statistics', createdAt: false, updatedAt: false })
export class Statistic extends Model<Statistic, StatisticCreationArgs> {
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
    example: 10,
    description:
      'Лучший результат по количеству дней повторения необходимых слов подряд',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: null,
    allowNull: true,
  })
  bestSteak!: number | null

  @ApiProperty({
    example: 10,
    description:
      'Текущий результат по количеству дней повторения необходимых слов подряд',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: null,
    allowNull: true,
  })
  currentStreak!: number | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего повторения необходимых слов',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastStreakDate!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последней проверки повторения необходимых слов',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastCheckStreakDate!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего повторения изученных слов',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastRepeatKnownWordsDate!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего реверсивного повторения изученных слов',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastReverseRepeatKnownWordsDate!: Date | null

  @ApiProperty({
    example: ['2004-10-19 10:23:54+02'],
    description: 'История повторения изученных слов',
  })
  @Column({
    type: DataType.ARRAY(DataType.DATE),
    defaultValue: [],
    allowNull: false,
  })
  repeatKnownWordsHistory!: Date[]

  @ApiProperty({
    example: ['2004-10-19 10:23:54+02'],
    description: 'История реверсивного повторения изученных слов',
  })
  @Column({
    type: DataType.ARRAY(DataType.DATE),
    defaultValue: [],
    allowNull: false,
  })
  reverseRepeatKnownWordsHistory!: Date[]
}
