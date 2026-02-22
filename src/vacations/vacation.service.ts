import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { Employee } from '../models/employee.model';
import { VacationSchedule, VacationStatus } from '../models/vacation-schedule.model';
import { ConsumptionAction, VacationConsumptionLog } from '../models/vacation-consumption-log.model';

import { ScheduleVacationDto } from './dto/schedule-vacation.dto';

export interface VacationStatusEvent {
  vacationId: number;
  employeeId: number;
  action: 'start' | 'finalize';
}

@Injectable()
export class VacationService {
  private readonly logger = new Logger(VacationService.name);

  constructor(
    @InjectModel(Employee)
    private readonly employeeModel: typeof Employee,

    @InjectModel(VacationSchedule)
    private readonly vacationModel: typeof VacationSchedule,

    @InjectModel(VacationConsumptionLog)
    private readonly consumptionLogModel: typeof VacationConsumptionLog,

    private readonly sequelize: Sequelize,
  ) {}

  // ─── API methods ───────────────────────────────────────────────────────────

  async schedule(dto: ScheduleVacationDto): Promise<VacationSchedule> {
    const { employeeId, startDate, endDate } = dto;

    const employee = await this.employeeModel.findByPk(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays > Number(employee.availableVacationDays)) {
      throw new UnprocessableEntityException('Insufficient vacation balance');
    }

    const overlap = await this.vacationModel.findOne({
      where: {
        employeeId,
        status: { [Op.in]: [VacationStatus.SCHEDULED, VacationStatus.IN_PROGRESS] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException('Vacation period overlaps with an existing schedule');
    }

    return this.vacationModel.create({ employeeId, startDate, endDate, totalDays });
  }

  async cancel(id: number, reason?: string): Promise<VacationSchedule> {
    const vacation = await this.vacationModel.findByPk(id);
    if (!vacation) throw new NotFoundException('Vacation schedule not found');

    if (vacation.status !== VacationStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot cancel a vacation with status '${vacation.status}'`,
      );
    }

    await vacation.update({
      status: VacationStatus.CANCELED,
      cancellationReason: reason ?? null,
    });

    return vacation;
  }

  async findAll(): Promise<VacationSchedule[]> {
    return this.vacationModel.findAll({ include: [Employee] });
  }

  async findByEmployee(employeeId: number): Promise<VacationSchedule[]> {
    return this.vacationModel.findAll({
      where: { employeeId },
      order: [['startDate', 'DESC']],
    });
  }

  async findOne(id: number): Promise<VacationSchedule> {
    const vacation = await this.vacationModel.findByPk(id, { include: [Employee] });
    if (!vacation) throw new NotFoundException('Vacation schedule not found');
    return vacation;
  }

  // ─── Cron helpers ─────────────────────────────────────────────────────────

  async findScheduledStartingToday(): Promise<VacationSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.vacationModel.findAll({
      where: { startDate: today, status: VacationStatus.SCHEDULED },
    });
  }

  async findEndedInProgress(): Promise<VacationSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.vacationModel.findAll({
      where: {
        status: VacationStatus.IN_PROGRESS,
        endDate: { [Op.lt]: today },
      },
    });
  }

  // ─── Consumer handlers ────────────────────────────────────────────────────

  async applyStart(event: VacationStatusEvent): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      const vacation = await this.vacationModel.findByPk(event.vacationId, {
        transaction: t,
        lock: true,
      });
      if (!vacation || vacation.status !== VacationStatus.SCHEDULED) return;

      await vacation.update({ status: VacationStatus.IN_PROGRESS }, { transaction: t });
      await this.consumptionLogModel.create(
        {
          vacationScheduleId: event.vacationId,
          employeeId: event.employeeId,
          action: ConsumptionAction.STARTED,
        },
        { transaction: t },
      );

      this.logger.log(`Vacation ${event.vacationId} started`);
    });
  }

  async applyFinalize(event: VacationStatusEvent): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      const vacation = await this.vacationModel.findByPk(event.vacationId, {
        transaction: t,
        lock: true,
      });
      if (!vacation || vacation.status !== VacationStatus.IN_PROGRESS) return;

      await vacation.update({ status: VacationStatus.FINALIZED }, { transaction: t });
      await this.consumptionLogModel.create(
        {
          vacationScheduleId: event.vacationId,
          employeeId: event.employeeId,
          action: ConsumptionAction.FINALIZED,
        },
        { transaction: t },
      );

      this.logger.log(`Vacation ${event.vacationId} finalized`);
    });
  }
}
