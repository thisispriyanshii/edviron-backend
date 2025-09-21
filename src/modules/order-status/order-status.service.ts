import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatus, OrderStatusDocument } from './schemas/order-status.schema';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async create(orderStatusData: Partial<OrderStatus>): Promise<OrderStatus> {
    const orderStatus = new this.orderStatusModel(orderStatusData);
    return orderStatus.save();
  }

  async findByCollectId(collectId: string): Promise<OrderStatus | null> {
    return this.orderStatusModel.findOne({ collect_id: collectId }).exec();
  }

  async updateByCollectId(collectId: string, updateData: Partial<OrderStatus>): Promise<OrderStatus | null> {
    return this.orderStatusModel.findOneAndUpdate(
      { collect_id: collectId },
      updateData,
      { new: true }
    ).exec();
  }

  async findAll(): Promise<OrderStatus[]> {
    return this.orderStatusModel.find().exec();
  }

  async findByStatus(status: string): Promise<OrderStatus[]> {
    return this.orderStatusModel.find({ status }).exec();
  }
}
