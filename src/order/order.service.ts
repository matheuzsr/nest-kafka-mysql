import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @Inject('ORDER_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.kafkaClient.emit(topic, message).toPromise();
      console.log(`Mensagem enviada para o tópico ${topic}:`, message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  sendMessageWithResponse(topic: string, message: any): Observable<any> {
    return this.kafkaClient.send(topic, message);
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
  }
}
