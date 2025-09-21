import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ required: true })
  received_at: Date;

  @Prop({ default: false })
  processed: boolean;

  @Prop()
  notes: string;

  @Prop()
  order_id: string;

  @Prop()
  status: string;

  @Prop()
  error_message: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export type WebhookLogDocument = WebhookLog & Document;
export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

// Add indexes for better performance
WebhookLogSchema.index({ received_at: -1 });
WebhookLogSchema.index({ processed: 1 });
WebhookLogSchema.index({ order_id: 1 });
WebhookLogSchema.index({ status: 1 });
