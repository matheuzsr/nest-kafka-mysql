import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { AccrualEvent } from './accrual.service';

export const ACCRUAL_TOPIC = 'vacation.accrual';

@Injectable()
export class AccrualProducer implements OnModuleInit {
  private readonly logger = new Logger(AccrualProducer.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {
    /* no-op */
  }

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  publish(event: AccrualEvent): void {
    this.logger.debug(
      `Publishing accrual event for employee ${event.employeeId}`,
    );
    this.kafkaClient.emit(ACCRUAL_TOPIC, {
      key: String(event.employeeId),
      value: JSON.stringify(event),
    });
  }
}
