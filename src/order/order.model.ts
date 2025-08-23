import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'orders',
  timestamps: true, // cria automaticamente createdAt e updatedAt
})
export class Order extends Model<Order> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare value: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;
}
