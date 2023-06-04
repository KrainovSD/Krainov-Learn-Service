import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/users/users.model'
import { Learns } from '../learns/learns.model'

export interface CategoryCreationArgs {
  userId: number
  name: string
  icon: string
  repeatRegularity: number[]
}

@Table({ tableName: 'categories', createdAt: false, updatedAt: false })
export class Category extends Model<Category, CategoryCreationArgs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
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
    example: 'animals',
    description: 'Абстрактное название категории',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
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
