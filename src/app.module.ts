import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import sequelizeConfig from './config/database.config';
import { OrderModule } from './order/order.module';
import { AccrualModule } from './accrual/accrual.module';
import { ScheduleModule } from '@nestjs/schedule';
import { VacationModule } from './vacations/vacation.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot(sequelizeConfig),
    OrderModule,
    AccrualModule,
    VacationModule,
  ],
  // providers: [],
})
export class AppModule { }
