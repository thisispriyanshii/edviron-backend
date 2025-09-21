import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusService } from '../order-status/order-status.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

@Injectable()
export class PaymentsService {
  private readonly paymentApiUrl = 'https://api.payment-gateway.com/create-payment'; // Replace with actual API URL

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private ordersService: OrdersService,
    private orderStatusService: OrderStatusService,
  ) {}

  async createPayment(createOrderDto: CreateOrderDto) {
    try {
      // Create order in database
      const order = await this.ordersService.create(createOrderDto);

      // Create order status
      await this.orderStatusService.create({
        collect_id: order._id,
        order_amount: createOrderDto.order_amount,
        status: 'created',
      });

      // Prepare payment payload
      const paymentPayload = {
        amount: createOrderDto.order_amount,
        currency: 'INR',
        order_id: order._id.toString(),
        customer_name: createOrderDto.student_info.name,
        customer_email: createOrderDto.student_info.email,
        customer_phone: createOrderDto.student_info.id,
        return_url: `${this.configService.get('FRONTEND_URL')}/payment-success`,
        webhook_url: `${this.configService.get('BACKEND_URL')}/webhook`,
        pg_key: this.configService.get('PAYMENT_PG_KEY'),
        school_id: createOrderDto.school_id,
        custom_order_id: createOrderDto.custom_order_id || order._id.toString(),
      };

      // Sign the payload with JWT
      const token = this.jwtService.sign(paymentPayload, {
        secret: this.configService.get('PAYMENT_API_KEY'),
      });

      // Call external payment API
      const response = await axios.post(this.paymentApiUrl, {
        ...paymentPayload,
        token,
      });

      if (response.data && response.data.payment_url) {
        // Update order with collect_id if provided
        if (response.data.collect_id) {
          await this.ordersService.updateCollectId(order._id.toString(), response.data.collect_id);
        }

        return {
          success: true,
          payment_url: response.data.payment_url,
          order_id: order._id.toString(),
          collect_id: response.data.collect_id,
        };
      } else {
        throw new BadRequestException('Failed to create payment');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new BadRequestException('Payment creation failed');
    }
  }

  async getPaymentStatus(orderId: string) {
    try {
      const order = await this.ordersService.findById(orderId);
      if (!order) {
        throw new BadRequestException('Order not found');
      }

      const orderStatus = await this.orderStatusService.findByCollectId(order._id.toString());
      
      return {
        order_id: order._id.toString(),
        custom_order_id: order.custom_order_id,
        school_id: order.school_id,
        student_info: order.student_info,
        order_amount: orderStatus?.order_amount || order.order_amount,
        transaction_amount: orderStatus?.transaction_amount,
        status: orderStatus?.status || order.status,
        payment_mode: orderStatus?.payment_mode,
        bank_reference: orderStatus?.bank_reference,
        payment_time: orderStatus?.payment_time,
        error_message: orderStatus?.error_message,
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      throw new BadRequestException('Failed to get payment status');
    }
  }
}
