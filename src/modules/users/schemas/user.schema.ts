import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop()
  school_id: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  last_login: Date;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

// ✅ Explicitly define UserDocument with _id
export type UserDocument = Document & {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  school_id?: string;
  is_active: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ school_id: 1 });
UserSchema.index({ role: 1 });
