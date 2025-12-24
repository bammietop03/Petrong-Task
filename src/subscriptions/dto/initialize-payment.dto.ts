import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class InitializePaymentDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
