import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  UseGuards,
  Body,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaystackWebhookDto } from './dto/webhook.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initialize a new subscription payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment initialization successful',
    schema: {
      example: {
        authorization_url: 'https://checkout.paystack.com/abc123xyz',
        access_code: 'abc123xyz',
        reference: 'ref_12345678',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initializePayment(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.initializePayment(user.sub, user.email);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify payment transaction' })
  @ApiQuery({
    name: 'reference',
    description: 'Payment reference from Paystack',
    required: true,
    example: 'ref_12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
    schema: {
      example: {
        status: 'success',
        message: 'Payment verified successfully',
        subscription: {
          isActive: true,
          expiresAt: '2025-01-24T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid reference' })
  async verifyPayment(@Query('reference') reference: string) {
    return this.subscriptionsService.verifyPayment(reference);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current subscription status' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved',
    schema: {
      example: {
        isActive: true,
        expiresAt: '2025-01-24T10:00:00.000Z',
        subscriptionCode: 'SUB_abc123xyz',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatus(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.getSubscriptionStatus(user.sub);
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel current subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    schema: {
      example: {
        message: 'Subscription cancelled successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  async cancelSubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.cancelSubscription(user.sub);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'Paystack webhook signature for verification',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        status: 'success',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: PaystackWebhookDto,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(body);

    // Verify webhook signature
    const isValid = this.subscriptionsService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook event
    await this.subscriptionsService.handleWebhook(body.event, body.data);

    return { status: 'success' };
  }
}
