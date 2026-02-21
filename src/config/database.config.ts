import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Employee } from '../models/employee.model';
import { VacationSchedule } from '../models/vacation-schedule.model';
import { VacationAccrualLog } from '../models/vacation-accrual-log.model';
import { VacationConsumptionLog } from '../models/vacation-consumption-log.model';

const config: SequelizeModuleOptions = {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'nestdb',
  // autoLoadModels: true,
  // synchronize: true,
  models: [
    Employee,
    VacationSchedule,
    VacationAccrualLog,
    VacationConsumptionLog,
  ],
  autoLoadModels: false,
  synchronize: false, // always false in production — use migrations
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

export default config;
module.exports = config; // necessário para o Sequelize CLI enxergar
