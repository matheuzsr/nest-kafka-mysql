import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Employee } from '../models/employee.model';
import { VacationAccrualLog } from '../models/vacation-accrual-log.model';

import { AccrualService } from './accrual.service';
import { AccrualCronJob } from './accrual.cron';
import { AccrualProducer } from './accrual.producer';
import { AccrualConsumerController } from './accrual.consumer';

@Module({
  imports: [
    SequelizeModule.forFeature([Employee, VacationAccrualLog]),
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
            groupId: 'nestjs-consumer',
            allowAutoTopicCreation: true,
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AccrualConsumerController],
  providers: [AccrualService, AccrualProducer, AccrualCronJob],
})
export class AccrualModule { }
