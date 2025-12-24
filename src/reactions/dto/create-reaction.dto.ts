import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReactionType {
  LIKE = 'LIKE',
  LAUGH = 'LAUGH',
  DISLIKE = 'DISLIKE',
  CLAP = 'CLAP',
}

export class CreateReactionDto {
  @ApiProperty({
    description: 'Type of reaction',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;

  @ApiProperty({
    description: 'ID of the todo to react to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  todoId: string;
}
