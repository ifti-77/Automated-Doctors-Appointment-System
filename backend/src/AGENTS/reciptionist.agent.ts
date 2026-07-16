import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import {
  AgentResponseType,
  DoctorDetailsForAgent,
} from 'src/shared/customeTypes';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from 'src/shared/RedisClient';

// 1. The Mock Schedule Data Structure
const dummySchedule = [
  {
    id: 1,
    doctor: 'Dr. Smith',
    availability: {
      saturday: { from: '10:00 AM', to: '1:00 PM' },
      sunday: { from: '10:00 AM', to: '1:00 PM' },
      monday: { from: null, to: null },
      tuesday: { from: '12:00 PM', to: '4:00 PM' },
      wednesday: { from: '12:00 PM', to: '4:00 PM' },
      thursday: { from: null, to: null },
      friday: { from: null, to: null },
    },
  },
  {
    id: 2,
    doctor: 'Dr. Alan',
    availability: {
      saturday: { from: null, to: null },
      sunday: { from: null, to: null },
      monday: { from: '1:00 PM', to: '6:00 PM' },
      tuesday: { from: '12:00 PM', to: '4:00 PM' },
      wednesday: { from: '12:00 PM', to: '4:00 PM' },
      thursday: { from: null, to: null },
      friday: { from: null, to: null },
    },
  },
];

@Injectable()
export class ReceptionistAgent {
  receptionistAgent: ReturnType<typeof createAgent>;

  constructor(
    @Inject('GROQ_Model') model: ChatGroq,
    private readonly redis: RedisClient,
  ) {
    this.receptionistAgent = createAgent({
      model: model,
      tools: [
        this.getDoctorDetails,
        this.checkAvailability,
        this.bookAppointment,
      ],
      name: 'Receptionist Agent',
      systemPrompt: `
        You are an elite automated medical receptionist for a clinic. 
        Your primary job is to help users check availability and book appointments with doctors.
        CRITICAL EXECUTION FLOW:
        1. If the user asks general questions about when a doctor is free, when they can be seen, or asks for a slot without providing a specific day, you MUST execute the 'getDoctorDetails' tool immediately using the provided 'doctorid'. Do not ask the user for clarifying details before running this tool.
        2. Once you receive the doctor's details payload, look at the full schedule matrix. If the user hasn't specified a day, summarize their general working days and hours from the payload, then ask which one they prefer.
        3. ALWAYS execute the 'checkAvailability' tool to double-check and lock in status for a specific day before attempting a booking.
        4. Never finalize an appointment booking via 'bookAppointment' without collecting: patientName, doctorid, doctorName, dayOfWeek, and timeSlot.
        5. Stay highly professional, brief, and clear.
  `,
    });
  }

  getDoctorDetails = tool(
    async ({ doctorid }) => {
      const doctorDetails: DoctorDetailsForAgent | null =
        await this.redis.getDoctorDetailsFromRedis(doctorid);
      if (!doctorDetails) {
        return `Doctor not found.`;
      }

      return JSON.stringify(doctorDetails);
    },
    {
      name: 'getDoctorDetails',
      description:
        'Use this tool to fetch the details of a specific doctor, including their name, specialization, contact info, and available chambers.',
      schema: z.object({
        doctorid: z
          .string()
          .uuid()
          .describe('The unique ID UUID of the doctor'),
      }),
    },
  );

  checkAvailability = tool(
    async ({ doctorid, dayOfWeek }) => {
      if (!(await this.redis.checkRedisForKey(`doctor:${doctorid}`))) {
        return `Doctor not found.`;
      }

      const doctorDetails: DoctorDetailsForAgent =
        (await this.redis.getDoctorDetailsFromRedis(
          doctorid,
        )) as DoctorDetailsForAgent;

      dayOfWeek.toLowerCase();
      const hours = doctorDetails.chambers.map(chamber => chamber.schedules.filter(
        schedule => schedule.day.toLowerCase() === dayOfWeek.toLowerCase()
      ))[0][0]

      if (!hours || hours.day.toLowerCase() !== dayOfWeek.toLowerCase()) {
        return `${doctorDetails.name} is not available on ${dayOfWeek}.`;
      }

      return `${doctorDetails.name} is available on ${dayOfWeek} from ${hours.start_time} to ${hours.end_time}.`;
    },
    {
      name: 'checkAvailability',
      description:
        'Use this tool to find out when a specific doctor is free on a given day of the week.',
      schema: z.object({
        doctorid: z
          .string()
          .uuid()
          .describe(
            'The unique ID UUID of the doctor, e.g., 1 for Dr. Smith or 2 for Dr. Alan',
          ),
        dayOfWeek: z
          .string()
          .describe("The day of the week to check, e.g., 'saturday', 'monday'"),
      }),
    },
  )

  // 3. Tool 2: Stage & Schedule Appointment
  bookAppointment = tool(
    async ({ doctorid, doctorName, dayOfWeek, timeSlot, patientName }) => {
      // In a final step, this tool will dispatch a payload to your NestJS service/BullMQ queue.
      return `SUCCESS: Scheduled an appointment for patient "${patientName}" with ${doctorName} on ${dayOfWeek} at ${timeSlot}. This job has been safely queued.`;
    },
    {
      name: 'bookAppointment',
      description:
        'Use this tool to finalize and lock in a specific appointment time slot once the user confirms it.',
      schema: z.object({
        doctorid: z
          .string()
          .uuid()
          .describe(
            'The unique ID UUID of the doctor, e.g., 1 for Dr. Smith or 2 for Dr. Alan',
          ),
        doctorName: z.string().describe('The name of the doctor'),
        dayOfWeek: z.string().describe('The chosen day of the week'),
        timeSlot: z
          .string()
          .describe("The specific requested time, e.g., '11:00 AM'"),
        patientName: z
          .string()
          .describe('The name of the patient booking the slot'),
      }),
    },
  );

  async RunAgent(
    role: string,
    content: string,
    doctorid: string,
  ): Promise<AgentResponseType> {
    try {
      const result = await this.receptionistAgent.invoke({
        messages: [
          {
            role: 'user',
            content: `${content} doctorID: ${doctorid}`,
          },
        ],
      });
      const messages = result.messages;
      // 1. Extract the initial prompt sent by the user
      const humanMsg = messages.find(
        (m: any) => (m._getType ? m._getType() : m.type) === 'human',
      );
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
                m.tool_call_id === toolCall.id,
            );

            stepsTaken.push({
              tool: toolCall.name,
              arguments: toolCall.args,
              result: toolReply ? toolReply.content : 'No output returned',
            });
          });
        }
      });

      // 3. Extract the final answer returned by the agent
      const aiMessages = messages.filter(
        (m: any) => (m._getType ? m._getType() : m.type) === 'ai',
      );
      const lastAiMsg = aiMessages[aiMessages.length - 1];
      const finalReply = lastAiMsg ? lastAiMsg.content : '';

      // 4. Return the consolidated clean object format
      return {
        success: true,
        userMessage,
        stepsTaken,
        finalReply,
      };
    } catch (error) {
      console.error('❌ Agent execution crashed:', error);
      throw error;
    }
  }
}

// WORK-PIN(ce9b19c1-10dd-4f65-a5d9-bb7ff8f27e60): redis workflow for agents
