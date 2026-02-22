import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { VacationService, VacationStatusEvent } from './vacation.service';
import { VacationProducer } from './vacation.producer';

@Injectable()
export class VacationCronJob {
  private readonly logger = new Logger(VacationCronJob.name);

  constructor(
    private readonly vacationService: VacationService,
    private readonly vacationProducer: VacationProducer,
  ) { }

  // Runs daily at midnight — starts vacations scheduled for today
  @Cron('0 0 * * *')
  async handleVacationStart(): Promise<void> {
    this.logger.log('Cron: checking vacations to start...');

    const vacations = await this.vacationService.findScheduledStartingToday();
    this.logger.log(`Found ${vacations.length} vacation(s) to start`);

    for (const vacation of vacations) {
      const event: VacationStatusEvent = {
        vacationId: vacation.id,
        employeeId: vacation.employeeId,
        action: 'start',
      };
      await this.vacationProducer.publishStatusUpdate(event);
    }
  }

  // Runs daily at midnight — finalizes vacations whose end date has passed
  @Cron('0 0 * * *')
  async handleVacationFinalize(): Promise<void> {
    this.logger.log('Cron: checking vacations to finalize...');

    const vacations = await this.vacationService.findEndedInProgress();
    this.logger.log(`Found ${vacations.length} vacation(s) to finalize`);

    for (const vacation of vacations) {
      const event: VacationStatusEvent = {
        vacationId: vacation.id,
        employeeId: vacation.employeeId,
        action: 'finalize',
      };
      await this.vacationProducer.publishStatusUpdate(event);
    }
  }
}
