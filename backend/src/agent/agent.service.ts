import { Injectable } from "@nestjs/common";
import { receptionistAgent } from "../AGENTS/reciptionist.agent";

export interface CleanAgentResponse {
    success: boolean;
    userMessage: string;
    stepsTaken: {
        tool: string;
        arguments: Record<string, any>;
        result: string;
    }[];
    finalReply: string;
}

@Injectable()
export class AgentService {
    constructor() { }

    GetAgent(): string {

        return "the agents are working"
    }

    async testAgent(): Promise<object> {

        try {
            const doctorid = 1
            const result = await receptionistAgent.invoke({
                messages: [
                    {
                        role: "user",
                        content: `Hi, I'm John Doe. is the doctor available on monday at 11:00 AM? doctorID: ${doctorid}`
                    }
                ],
            });
            const messages = result.messages;
            // 1. Extract the initial prompt sent by the user
            const humanMsg = messages.find((m: any) => (m._getType ? m._getType() : m.type) === 'human');
            const userMessage = humanMsg ? humanMsg.content : '';

            // 2. Extract and pair the tool executions sequentially
            const stepsTaken: any[] = [];

            messages.forEach((msg: any, index: number) => {
                const type = msg._getType ? msg._getType() : msg.type;

                // If the AI decided to call a tool
                if (type === 'ai' && msg.tool_calls && msg.tool_calls.length > 0) {
                    msg.tool_calls.forEach((toolCall: any) => {
                        // Find the corresponding tool response message following this call
                        const toolReply = messages.find(
                            (m: any) =>
                                (m._getType ? m._getType() : m.type) === 'tool' &&
                                m.tool_call_id === toolCall.id
                        );

                        stepsTaken.push({
                            tool: toolCall.name,
                            arguments: toolCall.args,
                            result: toolReply ? toolReply.content : 'No output returned'
                        });
                    });
                }
            });

            // 3. Extract the final answer returned by the agent
            const aiMessages = messages.filter((m: any) => (m._getType ? m._getType() : m.type) === 'ai');
            const lastAiMsg = aiMessages[aiMessages.length - 1];
            const finalReply = lastAiMsg ? lastAiMsg.content : '';

            // 4. Return the consolidated clean object format
            return {
                success: true,
                userMessage,
                stepsTaken,
                finalReply
            };


        } catch (error) {
            console.error("❌ Agent execution crashed:", error);
            throw error;
        }
    }


}