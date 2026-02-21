import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { Employee } from './employee.model';
import { VacationConsumptionLog } from './vacation-consumption-log.model';

export enum VacationStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  FINALIZED = 'finalized',
  CANCELED = 'canceled',
}

@Table({ tableName: 'vacation_schedules', underscored: true })
export class VacationSchedule extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Employee)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  employeeId: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  startDate: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  endDate: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  totalDays: number;

  @AllowNull(false)
  @Default(VacationStatus.SCHEDULED)
  @Column(DataType.ENUM(...Object.values(VacationStatus)))
  status: VacationStatus;

  @Column(DataType.STRING(255))
  cancellationReason: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // ─── Associations ──────────────────────────────────────────────────────────

  @BelongsTo(() => Employee, { foreignKey: 'employee_id' })
  employee: Employee;

  @HasMany(() => VacationConsumptionLog, { foreignKey: 'vacation_schedule_id' })
  consumptionLogs: VacationConsumptionLog[];

  // ─── Helpers ───────────────────────────────────────────────────────────────

  get isScheduled(): boolean {
    return this.status === VacationStatus.SCHEDULED;
  }

  get isInProgress(): boolean {
    return this.status === VacationStatus.IN_PROGRESS;
  }

  get isFinalized(): boolean {
    return this.status === VacationStatus.FINALIZED;
  }

  get isCancelable(): boolean {
    return this.status === VacationStatus.SCHEDULED;
  }
}
