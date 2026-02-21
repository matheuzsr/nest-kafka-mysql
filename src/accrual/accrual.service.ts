import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { Employee } from '../models/employee.model';
import { VacationAccrualLog } from '../models/vacation-accrual-log.model';

export const DAYS_TO_ACCRUE = 1.25;

export interface AccrualEvent {
  employeeId: number;
  daysToAdd: number;
  referenceMonth: string; // YYYY-MM
}

@Injectable()
export class AccrualService {
  private readonly logger = new Logger(AccrualService.name);

  constructor(
    @InjectModel(Employee)
    private readonly employeeModel: typeof Employee,

    @InjectModel(VacationAccrualLog)
    private readonly accrualLogModel: typeof VacationAccrualLog,

    private readonly sequelize: Sequelize,
  ) { }

  async findAllActive(): Promise<Employee[]> {
    return this.employeeModel.findAll({ where: { isActive: true } });
  }

  async applyAccrual(event: AccrualEvent): Promise<void> {
    const { employeeId, daysToAdd, referenceMonth } = event;

    await this.sequelize.transaction(async (t) => {
      const employee = await this.employeeModel.findByPk(employeeId, {
        transaction: t,
        lock: true,
      });

      if (!employee || !employee.isActive) {
        this.logger.warn(
          `Employee ${employeeId} not found or inactive — skipping`,
        );
        return;
      }

      const balanceBefore = Number(employee.availableVacationDays);
      const balanceAfter = +(balanceBefore + daysToAdd).toFixed(2);

      await employee.update(
        { availableVacationDays: balanceAfter },
        { transaction: t },
      );

      await this.accrualLogModel.create(
        {
          employeeId,
          daysAdded: daysToAdd,
          balanceBefore,
          balanceAfter,
          referenceMonth,
        },
        { transaction: t },
      );

      this.logger.log(
        `Accrual applied — employee: ${employeeId} | ${balanceBefore} → ${balanceAfter} days`,
      );
    });
  }
}
