import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/users/users.model'

export interface RepeatsCreationArgs {
  userId: number
  word: string
  translate: string
  transcription: string
  description: string
  example: string[]
  isIrregularVerb: boolean
  nextRepeat: Date
  nextReverseRepeat: Date
  dateCreate: Date
}

@Table({ tableName: 'repeats', createdAt: false, updatedAt: false })
export class Repeat extends Model<Repeat, RepeatsCreationArgs> {
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
    example: 'cat',
    description: 'Слово на английском',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  word!: string

  @ApiProperty({
    example: 'Кот',
    description: 'Перевод',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  translate!: string

  @ApiProperty({
    example: '[kæt]',
    description: 'Транскрипция',
  })
  @Column({
    type: DataType.STRING,
    defaultValue: null,
    allowNull: true,
  })
  transcription!: string | null

  @ApiProperty({
    example:
      'a small animal with fur, four legs, and a tail that is kept as a pet',
    description: 'Описание',
  })
  @Column({
    type: DataType.STRING,
    defaultValue: null,
    allowNull: true,
  })
  description!: string | null

  @ApiProperty({
    example: ['A cat walks by and wakes up the tiger.'],
    description: 'Примеры',
  })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
    allowNull: false,
  })
  example!: string[]

  @ApiProperty({
    example: false,
    description: 'Является ли слово неправильным глаголом',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isIrregularVerb!: boolean

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
    allowNull: false,
  })
  nextRepeat!: Date

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата следующего реверсивного повторения',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  nextReverseRepeat!: Date

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
    description: 'Дата создания',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateCreate!: Date
}
