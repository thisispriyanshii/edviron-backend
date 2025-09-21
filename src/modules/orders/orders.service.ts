import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  Logger,
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Validate input DTO
      const errors = await validate(plainToInstance(CreateOrderDto, createOrderDto));
      if (errors.length > 0) {
        const errorMessages = errors
          .map(error => error.constraints ? Object.values(error.constraints) : [])
          .flat()
          .filter(Boolean);
        
        if (errorMessages.length > 0) {
          throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
        }
      }

      // Check for duplicate custom_order_id if provided
      if (createOrderDto.custom_order_id) {
        const existingOrder = await this.orderModel.findOne({ 
          custom_order_id: createOrderDto.custom_order_id 
        }).exec();
        
        if (existingOrder) {
          throw new ConflictException(`An order with custom_order_id '${createOrderDto.custom_order_id}' already exists`);
        }
      }

      const order = new this.orderModel(createOrderDto);
      const savedOrder = await order.save();
      
      this.logger.log(`Order created successfully: ${savedOrder._id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Order[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.orderModel.find().skip(skip).limit(limit).exec(),
        this.orderModel.countDocuments().exec()
      ]);
      
      return { data, total };
    } catch (error) {
      this.logger.error(`Error fetching orders: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async findById(id: string): Promise<Order> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    try {
      const order = await this.orderModel.findById(id).exec();
      
      if (!order) {
        throw new NotFoundException(`Order with ID '${id}' not found`);
      }
      
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding order by ID ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find order');
    }
  }

  async findBySchoolId(schoolId: string, page = 1, limit = 10): Promise<{ data: Order[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const query = { school_id: schoolId };
      
      const [data, total] = await Promise.all([
        this.orderModel.find(query).skip(skip).limit(limit).exec(),
        this.orderModel.countDocuments(query).exec()
      ]);
      
      if (data.length === 0) {
        this.logger.warn(`No orders found for school ID: ${schoolId}`);
      }
      
      return { data, total };
    } catch (error) {
      this.logger.error(`Error finding orders for school ${schoolId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch orders for school');
    }
  }

  async findByCustomOrderId(customOrderId: string): Promise<Order> {
    try {
      const order = await this.orderModel.findOne({ custom_order_id: customOrderId }).exec();
      
      if (!order) {
        throw new NotFoundException(`Order with custom ID '${customOrderId}' not found`);
      }
      
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding order by custom ID ${customOrderId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find order');
    }
  }

  async updateCollectId(id: string, collectId: string): Promise<Order> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        id,
        { collect_id: collectId },
        { new: true, runValidators: true }
      ).exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID '${id}' not found`);
      }

      this.logger.log(`Collect ID updated for order: ${id}`);
      return updatedOrder;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating collect ID for order ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update collect ID');
    }
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const validStatuses = ['created', 'pending', 'success', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID '${id}' not found`);
      }

      this.logger.log(`Status updated to '${status}' for order: ${id}`);
      return updatedOrder;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Error updating status for order ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }
}
