/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';

interface OrderDto {
  description: string;
  value: number;
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('create')
  async sendMessage(@Body() orderDto: OrderDto) {
    const topic = 'create.order';

    await this.orderService.sendMessage(topic, {
      timestamp: new Date().toISOString(),
      data: orderDto,
    });

    return {
      success: true,
      message: 'Mensagem enviada com sucesso',
      topic,
    };
  }
}
