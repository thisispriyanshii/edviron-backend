import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../order-status/schemas/order-status.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getAllTransactions(queryParams: any) {
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      status,
      school_id,
      start_date,
      end_date,
    } = queryParams;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'statusDocs',
        },
      },
      {
        $unwind: {
          path: '$statusDocs',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          collect_id: '$statusDocs._id',
          school_id: '$school_id',
          gateway: '$gateway_name',
          order_amount: '$statusDocs.order_amount',
          transaction_amount: '$statusDocs.transaction_amount',
          status: '$statusDocs.status',
          custom_order_id: '$custom_order_id',
          student_info: '$student_info',
          payment_mode: '$statusDocs.payment_mode',
          bank_reference: '$statusDocs.bank_reference',
          payment_time: '$statusDocs.payment_time',
          error_message: '$statusDocs.error_message',
          created_at: '$created_at',
          updated_at: '$updated_at',
        },
      },
    ];

    // Add filters
    const matchConditions: any = {};
    if (status) {
      matchConditions.status = status;
    }
    if (school_id) {
      matchConditions.school_id = school_id;
    }
    if (start_date || end_date) {
      matchConditions.created_at = {};
      if (start_date) {
        matchConditions.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        matchConditions.created_at.$lte = new Date(end_date);
      }
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting
    const sortStage: any = {};
    sortStage[sort] = sortOrder;
    pipeline.push({ $sort: sortStage });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute aggregation
    const transactions = await this.orderModel.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.splice(-2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await this.orderModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionsBySchool(schoolId: string, queryParams: any) {
    return this.getAllTransactions({ ...queryParams, school_id: schoolId });
  }

  async getTransactionStatus(customOrderId: string) {
    const order = await this.orderModel.findOne({ custom_order_id: customOrderId });
    if (!order) {
      return null;
    }

    const orderStatus = await this.orderStatusModel.findOne({ collect_id: order._id });

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
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  async getTransactionStats() {
    const totalOrders = await this.orderModel.countDocuments();
    const totalAmount = await this.orderModel.aggregate([
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'statusDocs',
        },
      },
      {
        $unwind: {
          path: '$statusDocs',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$statusDocs.transaction_amount' },
        },
      },
    ]);

    const statusStats = await this.orderStatusModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalOrders,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].totalAmount : 0,
      statusStats,
    };
  }
}
