import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'This is a great todo! Keep up the good work.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID of the todo to comment on',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  todoId: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Updated comment content',
    example: 'Updated comment text',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateShareDto {
  @ApiProperty({
    description: 'ID of the todo to share',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  todoId: string;
}
