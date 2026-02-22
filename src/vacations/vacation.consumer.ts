import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { VacationService, VacationStatusEvent } from './vacation.service';
import { VACATION_STATUS_TOPIC } from './vacation.producer';
import { kafkaDeserialize } from 'src/common/helpers/kafka-deserialize.helper';

@Controller()
export class VacationConsumerController {
  private readonly logger = new Logger(VacationConsumerController.name);

  constructor(private readonly vacationService: VacationService) { }

  @MessagePattern(VACATION_STATUS_TOPIC)
  async handleStatusUpdate(@Payload() message: any): Promise<void> {
    const event = kafkaDeserialize<VacationStatusEvent>(message);

    this.logger.log(
      `Consumed status event — vacation: ${event.vacationId} | action: ${event.action}`,
    );

    try {
      if (event.action === 'start') {
        await this.vacationService.applyStart(event);
      } else if (event.action === 'finalize') {
        await this.vacationService.applyFinalize(event);
      }
    } catch (error) {
      this.logger.error(`Failed to process status event`, error.stack);
      throw error;
    }
  }
}
