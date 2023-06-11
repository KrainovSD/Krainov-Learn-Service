import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/users/users.model'

export interface RelevanceCreationArgs {
  userId: number
  word: string
  isIrregularVerb: boolean
  dateDetected: Date[]
}

@Table({ tableName: 'relevances', createdAt: false, updatedAt: false })
export class Relevance extends Model<Relevance, RelevanceCreationArgs> {
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
    example: false,
    description: 'Является ли слово неправильным глаголом',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isIrregularVerb!: boolean

  @ApiProperty({
    example: ['2004-10-19 10:23:54+02'],
    description: 'Переодичность встреч',
  })
  @Column({
    type: DataType.ARRAY(DataType.DATE),
    defaultValue: [],
    allowNull: false,
  })
  dateDetected!: Date[]
}
