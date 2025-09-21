import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderStatus {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  collect_id: Types.ObjectId;

  @Prop()
  order_amount: number;

  @Prop()
  transaction_amount: number;

  @Prop()
  payment_mode: string;

  @Prop()
  payment_details: string;

  @Prop()
  bank_reference: string;

  @Prop()
  payment_message: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  error_message: string;

  @Prop()
  payment_time: Date;

  @Prop({ type: Object })
  gateway_response: Object;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export type OrderStatusDocument = OrderStatus & Document;
export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);

// Add indexes for better performance
OrderStatusSchema.index({ collect_id: 1 });
OrderStatusSchema.index({ status: 1 });
OrderStatusSchema.index({ payment_time: -1 });
OrderStatusSchema.index({ bank_reference: 1 });
