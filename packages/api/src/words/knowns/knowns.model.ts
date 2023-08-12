import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/users/users.model'

export interface KnownsCreationArgs {
  userId: string
  id: string
  word: string
  translate: string
  transcription: string | null
  description: string | null
  example: string[]
  isIrregularVerb: boolean
  mistakes: number
  mistakesTotal: number
  dateCreate: Date
}

@Table({ tableName: 'knowns', createdAt: false, updatedAt: false })
export class Knowns extends Model<Knowns, KnownsCreationArgs> {
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
    example: 3,
    description: 'Количество последнего цикла ошибок в слове',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  mistakes!: number

  @ApiProperty({
    example: 3,
    description: 'Общее количество ошибок в слове',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  mistakesTotal!: number

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
