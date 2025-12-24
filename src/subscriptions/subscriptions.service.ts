import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

interface PaystackWebhookData {
  metadata?: {
    userId?: string;
  };
  customer?: {
    id?: string;
    customer_code?: string;
  };
  authorization?: {
    authorization_code?: string;
  };
  subscription_code?: string;
  next_payment_date?: string;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async initializePayment(userId: string, email: string) {
    const secretKey = this.configService.get<string>('paystack.secretKey');
    const planCode = this.configService.get<string>(
      'paystack.subscriptionPlanCode',
    );

    if (!secretKey || !planCode) {
      throw new BadRequestException('Paystack configuration is missing');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.paystackBaseUrl}/transaction/initialize`,
          {
            email,
            amount: 500000, // 5000 NGN in kobo (monthly subscription)
            plan: planCode,
            metadata: {
              userId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      this.logger.error(
        'Paystack initialization error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async verifyPayment(reference: string) {
    const secretKey = this.configService.get<string>('paystack.secretKey');

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.paystackBaseUrl}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
            },
          },
        ),
      );
      console.log('response:', response);
      const { data } = response.data;
      console.log('data:', data);

      if (data.status === 'success') {
        const userId = data.metadata.userId;

        // Calculate subscription end date (30 days from now)
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            isSubscribed: true,
            subscriptionEndDate,
            paystackCustomerId: data.customer.id.toString(),
            paystackSubscriptionCode: data.authorization?.authorization_code,
          },
        });

        return {
          message: 'Subscription activated successfully',
          subscriptionEndDate,
        };
      }

      throw new BadRequestException('Payment verification failed');
    } catch (error) {
      this.logger.error(
        'Paystack verification error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to verify payment');
    }
  }

  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        paystackSubscriptionCode: true,
        paystackCustomerId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secretKey = this.configService.get<string>('paystack.secretKey');

    try {
      if (user.paystackSubscriptionCode) {
        await firstValueFrom(
          this.httpService.post(
            `${this.paystackBaseUrl}/subscription/disable`,
            {
              code: user.paystackSubscriptionCode,
              token: user.paystackCustomerId,
            },
            {
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isSubscribed: false,
          paystackSubscriptionCode: null,
        },
      });

      return { message: 'Subscription cancelled successfully' };
    } catch (error) {
      this.logger.error(
        'Paystack cancellation error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isSubscribed: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      isSubscribed: user.isSubscribed,
      subscriptionEndDate: user.subscriptionEndDate,
      isActive:
        user.isSubscribed &&
        (!user.subscriptionEndDate || new Date() < user.subscriptionEndDate),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');

    const expiredUsers = await this.prisma.user.updateMany({
      where: {
        isSubscribed: true,
        subscriptionEndDate: {
          lt: new Date(),
        },
      },
      data: {
        isSubscribed: false,
      },
    });

    this.logger.log(`Marked ${expiredUsers.count} subscriptions as expired`);
  }

  /**
   * Verify Paystack webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secretKey = this.configService.get<string>('paystack.secretKey');
    if (!secretKey) {
      throw new BadRequestException('Paystack secret key is not configured');
    }
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Handle Paystack webhook events
   */
  async handleWebhook(event: string, data: PaystackWebhookData) {
    this.logger.log(`Processing webhook event: ${event}`);

    try {
      switch (event) {
        case 'charge.success':
          await this.handleChargeSuccess(data);
          break;

        case 'subscription.create':
          await this.handleSubscriptionCreate(data);
          break;

        case 'subscription.disable':
          await this.handleSubscriptionDisable(data);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(data);
          break;

        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Webhook processing error for ${event}:`, error);
      throw error;
    }
  }

  private async handleChargeSuccess(data: PaystackWebhookData) {
    const userId = data.metadata?.userId;

    if (!userId) {
      this.logger.warn('No userId in charge.success metadata');
      return;
    }

    // Calculate subscription end date (30 days from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEndDate,
        paystackCustomerId: data.customer?.id?.toString() || data.customer?.customer_code,
        paystackSubscriptionCode: data.authorization?.authorization_code,
      },
    });

    this.logger.log(`Subscription activated for user ${userId}`);
  }

  private async handleSubscriptionCreate(data: PaystackWebhookData) {
    const customerCode = data.customer?.customer_code;

    if (!customerCode) {
      this.logger.warn('No customer code in subscription.create');
      return;
    }

    // Find user by Paystack customer ID
    const user = await this.prisma.user.findFirst({
      where: { paystackCustomerId: customerCode },
    });

    if (!user) {
      this.logger.warn(`User not found for customer ${customerCode}`);
      return;
    }

    const nextPaymentDate = data.next_payment_date
      ? new Date(data.next_payment_date)
      : new Date();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: true,
        subscriptionEndDate: nextPaymentDate,
        paystackSubscriptionCode: data.authorization?.authorization_code,
      },
    });

    this.logger.log(`Subscription created for user ${user.id}`);
  }

  private async handleSubscriptionDisable(data: PaystackWebhookData) {
    const subscriptionCode = data.subscription_code;

    if (!subscriptionCode) {
      this.logger.warn('No subscription code in subscription.disable');
      return;
    }

    await this.prisma.user.updateMany({
      where: { paystackSubscriptionCode: subscriptionCode },
      data: {
        isSubscribed: false,
        paystackSubscriptionCode: null,
      },
    });

    this.logger.log(`Subscription disabled: ${subscriptionCode}`);
  }

  private async handlePaymentFailed(data: PaystackWebhookData) {
    const customerCode = data.customer?.customer_code;

    if (!customerCode) {
      this.logger.warn('No customer code in invoice.payment_failed');
      return;
    }

    // Find user and mark subscription as inactive
    const user = await this.prisma.user.findFirst({
      where: { paystackCustomerId: customerCode },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isSubscribed: false },
      });

      this.logger.log(
        `Subscription deactivated due to payment failure: ${user.id}`,
      );
    }
  }
}
