import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true })
  school_id: string;

  @Prop()
  trustee_id: string;

  @Prop({ type: Object })
  student_info: {
    name: string;
    id: string;
    email: string;
  };

  @Prop()
  gateway_name: string;

  @Prop()
  custom_order_id: string;

  @Prop()
  order_amount: number;

  @Prop()
  collect_id: string;

  @Prop({ default: 'created' })
  status: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);

// Add indexes for better performance
OrderSchema.index({ school_id: 1 });
OrderSchema.index({ custom_order_id: 1 });
OrderSchema.index({ collect_id: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ created_at: -1 });
