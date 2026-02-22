import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { VacationStatusEvent } from './vacation.service';

export const VACATION_STATUS_TOPIC = 'vacation.status-update';

@Injectable()
export class VacationProducer implements OnModuleInit {
  private readonly logger = new Logger(VacationProducer.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  async publishStatusUpdate(event: VacationStatusEvent): Promise<void> {
    this.logger.debug(
      `Publishing status event — vacation ${event.vacationId} | action: ${event.action}`,
    );
    this.kafkaClient.emit(VACATION_STATUS_TOPIC, {
      key: String(event.vacationId),
      value: JSON.stringify(event),
    });
  }
}
