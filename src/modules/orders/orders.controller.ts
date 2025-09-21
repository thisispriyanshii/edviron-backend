import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Order with this custom_order_id already exists.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      // Let the exception filter handle known exceptions
      if (error.status === 400 || error.status === 409) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated list of orders.' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    try {
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      
      return await this.ordersService.findAll(page, limit);
    } catch (error) {
      if (error.status === 400) throw error;
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TRUSTEE)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order with the specified ID.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.ordersService.findById(id);
    } catch (error) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  @Get('school/:schoolId')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get orders by school ID with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated list of orders for the specified school.' })
  async findBySchoolId(
    @Param('schoolId') schoolId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    try {
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      
      return await this.ordersService.findBySchoolId(schoolId, page, limit);
    } catch (error) {
      if (error.status === 400) throw error;
      throw new InternalServerErrorException('Failed to fetch orders for school');
    }
  }

  @Get('custom/:customOrderId')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TRUSTEE)
  @ApiOperation({ summary: 'Get order by custom order ID' })
  @ApiResponse({ status: 200, description: 'Returns the order with the specified custom order ID.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findByCustomOrderId(@Param('customOrderId') customOrderId: string) {
    try {
      return await this.ordersService.findByCustomOrderId(customOrderId);
    } catch (error) {
      if (error.status === 404) throw error;
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  @Post(':id/collect-id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update collect ID for an order' })
  @ApiResponse({ status: 200, description: 'Collect ID updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateCollectId(
    @Param('id') id: string,
    @Body('collectId') collectId: string
  ) {
    try {
      if (!collectId) {
        throw new BadRequestException('collectId is required');
      }
      return await this.ordersService.updateCollectId(id, collectId);
    } catch (error) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update collect ID');
    }
  }

  @Post(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update status of an order' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid status value.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    try {
      if (!status) {
        throw new BadRequestException('status is required');
      }
      return await this.ordersService.updateStatus(id, status);
    } catch (error) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update order status');
    }
  }
}
