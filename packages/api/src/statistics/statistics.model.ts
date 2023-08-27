import { User } from './../users/users.model'
import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'

type StatisticCreationArgs = {
  id: string
  userId: string
}

@Table({ tableName: 'statistics', createdAt: false, updatedAt: false })
export class Statistic extends Model<Statistic, StatisticCreationArgs> {
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
}
