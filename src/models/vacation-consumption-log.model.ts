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
import { VacationSchedule } from './vacation-schedule.model';

export enum ConsumptionAction {
  STARTED = 'started',
  DAY_CONSUMED = 'day_consumed',
  FINALIZED = 'finalized',
}

@Table({
  tableName: 'vacation_consumption_logs',
  underscored: true,
  timestamps: false,
})
export class VacationConsumptionLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => VacationSchedule)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  vacationScheduleId: number;

  @ForeignKey(() => Employee)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  employeeId: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ConsumptionAction)))
  action: ConsumptionAction;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  processedAt: Date;

  // ─── Associations ──────────────────────────────────────────────────────────

  @BelongsTo(() => VacationSchedule, { foreignKey: 'vacation_schedule_id' })
  vacationSchedule: VacationSchedule;

  @BelongsTo(() => Employee, { foreignKey: 'employee_id' })
  employee: Employee;
}
