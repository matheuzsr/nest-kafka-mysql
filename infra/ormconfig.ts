import { SequelizeModuleOptions } from '@nestjs/sequelize';

const config: SequelizeModuleOptions = {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'nestdb',
  autoLoadModels: true,
  synchronize: true,
};

export default config;
