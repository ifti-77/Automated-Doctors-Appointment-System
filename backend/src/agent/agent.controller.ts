import { Controller, Get } from "@nestjs/common";
import { AgentService } from "./agent.service";

@Controller("agent")
export class AgentController {

    constructor(private readonly agentService: AgentService) {}

    @Get("/")
    getAgent(): string {
        return this.agentService.GetAgent();
    }

    @Get("/test-agent")
    testAgent(): Promise<object> {
        return this.agentService.testAgent();
    }
}
