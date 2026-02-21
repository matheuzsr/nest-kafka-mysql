import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  AllowNull,
  Default,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { Employee } from './employee.model';

@Table({
  tableName: 'vacation_accrual_logs',
  underscored: true,
  timestamps: false,
})
export class VacationAccrualLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Employee)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  employeeId: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
  daysAdded: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(6, 2))
  balanceBefore: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(6, 2))
  balanceAfter: number;

  /** Format: YYYY-MM */
  @AllowNull(false)
  @Column(DataType.STRING(7))
  referenceMonth: string;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  processedAt: Date;

  // ─── Associations ──────────────────────────────────────────────────────────

  @BelongsTo(() => Employee, { foreignKey: 'employee_id' })
  employee: Employee;
}
