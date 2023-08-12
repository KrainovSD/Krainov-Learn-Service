import { ApiProperty } from '@nestjs/swagger'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript'
import { Category } from '../categories/categories.model'

export interface LearnCreationArgs {
  id: string
  categoryId: string
  word: string
  translate: string
  isIrregularVerb: boolean
}

@Table({ tableName: 'learns', createdAt: false, updatedAt: false })
export class Learns extends Model<Learns, LearnCreationArgs> {
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
    description: 'Уникальный идентификатор категории',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @ForeignKey(() => Category)
  categoryId!: string

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

  @BelongsTo(() => Category)
  category!: Category
}
