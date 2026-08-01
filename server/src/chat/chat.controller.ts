import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('status')
  @ApiOperation({ summary: 'Chat availability', description: 'Checks whether the local Ollama model is reachable.' })
  status() {
    return this.service.status();
  }

  @Post()
  @ApiOperation({ summary: 'Send a chat message', description: 'Sends a message to the local Ollama model. The model can call DSA Sheet tools (topics, problems, progress).' })
  @ApiBody({ schema: { example: { message: 'What is my progress?', history: [] } } })
  @ApiResponse({ status: 201, description: 'Chat reply.' })
  chat(@Request() req: any, @Body() body: ChatDto) {
    return this.service.chat(req.user, body.message, body.history);
  }
}
