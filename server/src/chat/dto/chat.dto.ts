import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatHistoryItem {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  history?: ChatHistoryItem[];
}
