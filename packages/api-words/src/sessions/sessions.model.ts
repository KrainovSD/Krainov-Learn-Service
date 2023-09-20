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
import { WorkKind, WorkType } from '../work/work.service'

export interface SessionsCreationArgs {
  id?: string
  userId: string
  kind: WorkKind
  type: WorkType
  successCount: number
  errorCount: number
  date: Date
}

@Table({
  tableName: 'sessions',
  createdAt: false,
  updatedAt: false,
  indexes: [{ name: 'session_user_index', using: 'BTREE', fields: ['userId'] }],
})
export class Sessions extends Model<Sessions, SessionsCreationArgs> {
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
    example: 'known',
    description: 'Тип сессии',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: WorkType

  @ApiProperty({
    example: 'reverse',
    description: 'Вид сессии',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  kind!: WorkKind

  @ApiProperty({
    example: 5,
    description: 'Количество правильных слов',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  successCount!: number

  @ApiProperty({
    example: 5,
    description: 'Количество неправильных слов',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  errorCount!: number

  @ApiProperty({
    example: '2004-10-19 10:23:54+02',
    description: 'Дата создания сессии',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date!: Date
}
