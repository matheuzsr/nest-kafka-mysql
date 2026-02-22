import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Employee } from '../models/employee.model';
import { VacationSchedule } from '../models/vacation-schedule.model';
import { VacationConsumptionLog } from '../models/vacation-consumption-log.model';

import { VacationService } from './vacation.service';
import { VacationController } from './vacation.controller';
import { VacationCronJob } from './vacation.cron';
import { VacationProducer } from './vacation.producer';
import { VacationConsumerController } from './vacation.consumer';

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, VacationSchedule, VacationConsumptionLog]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nestjs-app',
            brokers: ['localhost:9092'],
            retry: {
              retries: 3,
              initialRetryTime: 100,
              maxRetryTime: 30000,
            },
          },
          consumer: {
            groupId: 'nestjs-vacation-consumer',
            allowAutoTopicCreation: true,
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [VacationController, VacationConsumerController],
  providers: [VacationService, VacationProducer, VacationCronJob],
})
export class VacationModule { }
