import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AccrualService, AccrualEvent } from './accrual.service';
import { ACCRUAL_TOPIC } from './accrual.producer';

@Controller()
export class AccrualConsumerController {
  private readonly logger = new Logger(AccrualConsumerController.name);

  constructor(private readonly accrualService: AccrualService) { }

  @MessagePattern(ACCRUAL_TOPIC)
  async handleAccrualEvent(@Payload() message: any): Promise<void> {
    console.log('Received message:', message);
    const event: AccrualEvent =
      typeof message === 'string' ? JSON.parse(message) : message;

    this.logger.log(
      `Consumed accrual event — employee: ${event.employeeId} | month: ${event.referenceMonth}`,
    );

    try {
      await this.accrualService.applyAccrual(event);
    } catch (error) {
      this.logger.error(
        `Failed to apply accrual for employee ${event.employeeId}`,
        error.stack,
      );
      throw error; // re-throw so Kafka retries
    }
  }
}
