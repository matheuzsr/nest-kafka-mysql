import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// Services
import { OrderService } from './order.service';

// Controllers
import { OrderController } from './order.controller';

// Models
import { Order } from './order.model';
import { OrderConsumerController } from './order.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // Registra a model Order para uso com @InjectModel
    SequelizeModule.forFeature([Order]),
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
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
  controllers: [OrderController, OrderConsumerController],
  providers: [OrderService],
})
export class OrderModule { }
