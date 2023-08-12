import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/users/users.model'
import { Learns } from '../learns/learns.model'

export interface CategoryCreationArgs {
  id: string
  userId: string
  name: string
  icon: string
  repeatRegularity: number[]
}

@Table({ tableName: 'categories', createdAt: false, updatedAt: false })
export class Category extends Model<Category, CategoryCreationArgs> {
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
    example: 'animals',
    description: 'Абстрактное название категории',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string

  @ApiProperty({
    example: 'example.png',
    description: 'Название иконки',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  icon!: string

  @ApiProperty({
    example: false,
    description: 'Статус изучения категории',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isLearn!: boolean

  @ApiProperty({
    example: [2, 2, 2, 4, 4, 4, 8, 8],
    description:
      'Регулярность повторения слов с ошибками (интервал между повторениями)',
  })
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: false,
  })
  repeatRegularity!: number[]

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего повторения',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastRepeat!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата последнего реверсивного повторения',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  lastReverseRepeat!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата следующего повторения',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  nextRepeat!: Date | null

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата следующего реверсивного повторения',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  nextReverseRepeat!: Date | null

  @ApiProperty({
    example: ['2004-10-19 10:23:54+02'],
    description: 'История повторения',
  })
  @Column({
    type: DataType.ARRAY(DataType.DATE),
    defaultValue: [],
    allowNull: false,
  })
  repeatHistory!: Date[]

  @ApiProperty({
    example: ['2004-10-19 10:23:54+02'],
    description: 'История реверсивного повторения',
  })
  @Column({
    type: DataType.ARRAY(DataType.DATE),
    defaultValue: [],
    allowNull: false,
  })
  reverseRepeatHistory!: Date[]

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата начала изучения категории',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  })
  learnStartDate!: Date | null

  @HasMany(() => Learns, { onDelete: 'CASCADE' })
  learns!: Learns[]
}
