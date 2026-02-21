import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Unique,
  AllowNull,
  Default,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { VacationSchedule } from './vacation-schedule.model';
import { VacationAccrualLog } from './vacation-accrual-log.model';
import { VacationConsumptionLog } from './vacation-consumption-log.model';

@Table({ tableName: 'employees', underscored: true })
export class Employee extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(150))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare email: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(11))
  declare cpf: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare department: string;

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY, field: 'hire_date' })
  declare hireDate: string;

  @AllowNull(false)
  @Default(0)
  @Column({ type: DataType.DECIMAL(6, 2), field: 'available_vacation_days' })
  declare availableVacationDays: number;

  @AllowNull(false)
  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => VacationSchedule, { foreignKey: 'employee_id' })
  vacationSchedules: VacationSchedule[];

  @HasMany(() => VacationAccrualLog, { foreignKey: 'employee_id' })
  accrualLogs: VacationAccrualLog[];

  @HasMany(() => VacationConsumptionLog, { foreignKey: 'employee_id' })
  consumptionLogs: VacationConsumptionLog[];
}
