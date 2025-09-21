import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.webhooksService.processWebhook(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getWebhookLogs() {
    return this.webhooksService.getWebhookLogs();
  }
}
