import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookLog, WebhookLogDocument } from './schemas/webhook-log.schema';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusService } from '../order-status/order-status.service';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(WebhookLog.name) private webhookLogModel: Model<WebhookLogDocument>,
    private ordersService: OrdersService,
    private orderStatusService: OrderStatusService,
  ) {}

  async processWebhook(payload: any) {
    try {
      // Log the webhook payload
      const webhookLog = new this.webhookLogModel({
        payload,
        received_at: new Date(),
        processed: false,
        notes: 'Webhook received',
      });
      await webhookLog.save();

      // Extract order information from payload
      const orderId = payload.order_info?.order_id || payload.collect_id;
      const status = payload.status || payload.payment_status;
      const transactionAmount = payload.transaction_amount || payload.amount;
      const bankReference = payload.bank_reference || payload.transaction_id;
      const paymentMode = payload.payment_mode || payload.payment_method;
      const paymentTime = payload.payment_time || payload.transaction_time;

      if (!orderId) {
        await this.updateWebhookLog(webhookLog._id.toString(), {
          processed: true,
          notes: 'No order ID found in payload',
          status: 'error',
        });
        return { success: false, message: 'No order ID found' };
      }

      // Find the order
      const order = await this.ordersService.findById(orderId);
      if (!order) {
        await this.updateWebhookLog(webhookLog._id.toString(), {
          processed: true,
          notes: 'Order not found',
          status: 'error',
        });
        return { success: false, message: 'Order not found' };
      }

      // Update order status
      await this.ordersService.updateStatus(order._id.toString(), status);

      // Update or create order status record
      const existingOrderStatus = await this.orderStatusService.findByCollectId(order._id.toString());
      
      const orderStatusData = {
        order_amount: existingOrderStatus?.order_amount || order.order_amount,
        transaction_amount: transactionAmount,
        payment_mode: paymentMode,
        bank_reference: bankReference,
        status: status,
        payment_time: paymentTime ? new Date(paymentTime) : new Date(),
        gateway_response: payload,
      };

      if (existingOrderStatus) {
        await this.orderStatusService.updateByCollectId(order._id.toString(), orderStatusData);
      } else {
        await this.orderStatusService.create({
          collect_id: order._id,
          ...orderStatusData,
        });
      }

      // Update webhook log as processed
      await this.updateWebhookLog(webhookLog._id.toString(), {
        processed: true,
        notes: 'Webhook processed successfully',
        status: 'success',
        order_id: orderId,
      });

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { success: false, message: 'Webhook processing failed' };
    }
  }

  private async updateWebhookLog(logId: string, updateData: any) {
    await this.webhookLogModel.findByIdAndUpdate(logId, updateData);
  }

  async getWebhookLogs() {
    return this.webhookLogModel.find().sort({ received_at: -1 }).exec();
  }
}
