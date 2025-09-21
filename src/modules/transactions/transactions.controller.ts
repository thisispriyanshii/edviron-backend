import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllTransactions(@Query() queryParams: any) {
    return this.transactionsService.getAllTransactions(queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query() queryParams: any,
  ) {
    return this.transactionsService.getTransactionsBySchool(schoolId, queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:customOrderId')
  async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.transactionsService.getTransactionStatus(customOrderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getTransactionStats() {
    return this.transactionsService.getTransactionStats();
  }
}
