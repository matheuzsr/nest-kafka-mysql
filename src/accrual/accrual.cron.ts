import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format } from 'date-fns';

import {
  AccrualService,
  AccrualEvent,
  DAYS_TO_ACCRUE,
} from './accrual.service';
import { AccrualProducer } from './accrual.producer';

@Injectable()
export class AccrualCronJob {
  private readonly logger = new Logger(AccrualCronJob.name);

  constructor(
    private readonly accrualService: AccrualService,
    private readonly accrualProducer: AccrualProducer,
  ) { }

  /* To test use - CronExpression.EVERY_MINUTE */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAccrual() {
    this.logger.log('Accrual cron triggered');

    const referenceMonth = format(new Date(), 'yyyy-MM');
    const employees = await this.accrualService.findAllActive();

    this.logger.log(
      `Found ${employees.length} active employees — publishing events...`,
    );

    for (const employee of employees) {
      const event: AccrualEvent = {
        employeeId: employee.id,
        daysToAdd: DAYS_TO_ACCRUE,
        referenceMonth,
      };
      this.accrualProducer.publish(event);
    }
  }
}
