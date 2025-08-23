import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';

interface Message {
  timestamp: string;
  data: {
    description: string;
    value: number;
  };
}

@Controller()
export class OrderConsumerController {
  constructor(@InjectModel(Order) private orderModel: typeof Order) { }

  @MessagePattern('create.order')
  handleOrderCreate(@Payload() message: Message) {
    console.log('Mensagem recebida no consumidor:', message);
    const orderData = message?.data;
    return this.orderModel.create<Order>(orderData as unknown as Order);
  }
}
