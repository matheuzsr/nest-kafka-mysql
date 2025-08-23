import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import sequelizeConfig from '../infra/ormconfig';
import { OrderModule } from './order/order.module';

@Module({
  imports: [SequelizeModule.forRoot(sequelizeConfig), OrderModule],
  // providers: [],
})
export class AppModule { }
