import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { Category } from '../categories/categories.model'

export interface LearnCreationArgs {
  categoryId: number
  word: string
  translate: string
  isIrregularVerb: boolean
}

@Table({ tableName: 'learns', createdAt: false, updatedAt: false })
export class Learns extends Model<Learns, LearnCreationArgs> {
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
    description: 'Уникальный идентификатор категории',
  })
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number

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
}
