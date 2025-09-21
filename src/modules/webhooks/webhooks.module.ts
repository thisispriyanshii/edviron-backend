import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookLog, WebhookLogSchema } from './schemas/webhook-log.schema';
import { OrdersModule } from '../orders/orders.module';
import { OrderStatusModule } from '../order-status/order-status.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WebhookLog.name, schema: WebhookLogSchema }]),
    OrdersModule,
    OrderStatusModule,
  ],
  providers: [WebhooksService],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}
