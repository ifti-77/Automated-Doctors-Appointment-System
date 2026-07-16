import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('/')
  getAgent(): string {
    return this.agentService.GetAgent();
  }

  @Post('/use-agent')
  userAgent(@Body('content') content: string, @Body('doctorId') doctorId: string): Promise<object> {
    return this.agentService.useAgent(content, doctorId);
  }
}
