import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Todo title',
    example: 'Complete project documentation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Todo description',
    example: 'Write comprehensive API documentation with examples',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Todo title',
    example: 'Updated todo title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Todo description',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Todo completion status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
