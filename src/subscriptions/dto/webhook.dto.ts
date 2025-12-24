import { IsString, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  [key: string]: unknown;
}

export class PaystackWebhookDto {
  @ApiProperty({
    description: 'Paystack webhook event type',
    example: 'charge.success',
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({
    description: 'Webhook event data from Paystack',
    example: {
      metadata: { userId: '550e8400-e29b-41d4-a716-446655440000' },
      customer: { id: '123', customer_code: 'CUS_xxx' },
      authorization: { authorization_code: 'AUTH_xxx' },
      subscription_code: 'SUB_xxx',
    },
  })
  @IsObject()
  @IsNotEmpty()
  data: PaystackWebhookData;
}
