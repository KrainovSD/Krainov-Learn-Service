import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, Model, Sequelize, Table } from 'sequelize-typescript'

export interface RepeatsCreationArgs {
  id: string
  userId: string
  word: string
  translate: string
  transcription: string | null
  description: string | null
  example: string[]
  isIrregularVerb: boolean
  nextRepeat: Date
  nextReverseRepeat: Date
  dateCreate: Date
}

@Table({
  tableName: 'repeats',
  createdAt: false,
  updatedAt: false,
  indexes: [{ name: 'repeat_word_index', using: 'BTREE', fields: ['word'] }],
})
export class Repeats extends Model<Repeats, RepeatsCreationArgs> {
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
    example: 2,
    description: 'Количество успешных повторений',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: -1,
    allowNull: false,
  })
  countRepeat!: number

  @ApiProperty({
    example: 2,
    description: 'Количество успешных реверсивных повторений',
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: -1,
    allowNull: false,
  })
  countReverseRepeat!: number

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
