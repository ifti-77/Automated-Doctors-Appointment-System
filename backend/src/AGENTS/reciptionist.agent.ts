// backend/src/agent/receptionist.agent.ts
import { createAgent, tool } from "langchain";
import { z } from "zod";
import { model } from "./modelProvider"; // Uses the ChatGroq model you defined

// 1. The Mock Schedule Data Structure
const dummySchedule = [
  {
    id: 1,
    doctor: "Dr. Smith",
    availability: {
      saturday: { from: "10:00 AM", to: "1:00 PM" },
      sunday: { from: "10:00 AM", to: "1:00 PM" },
      monday: { from: null, to: null },
      tuesday: { from: "12:00 PM", to: "4:00 PM" },
      wednesday: { from: "12:00 PM", to: "4:00 PM" },
      thursday: { from: null, to: null },
      friday: { from: null, to: null },
    }
  },
  {
    id: 2,
    doctor: "Dr. Alan",
    availability: {
      saturday: { from: null, to: null },
      sunday: { from: null, to: null },
      monday: { from: "1:00 PM", to: "6:00 PM" },
      tuesday: { from: "12:00 PM", to: "4:00 PM" },
      wednesday: { from: "12:00 PM", to: "4:00 PM" },
      thursday: { from: null, to: null },
      friday: { from: null, to: null },
    }
  }
];

// 2. Tool 1: Check Doctor Availability (Strictly Structured)
const checkAvailability = tool(
  async ({ doctorid, doctorName, dayOfWeek }) => {
    const doc = dummySchedule.find(
      (d) => d.id === doctorid
    );

    if (!doc) {
      return `Doctor "${doctorName}" not found. Available doctors are: Dr. Smith, Dr. Alan`;
    }

    const day = dayOfWeek.toLowerCase();
    const hours = doc.availability[day as keyof typeof doc.availability];

    if (!hours || !hours.from) {
      return `${doc.doctor} is not available on ${dayOfWeek}.`;
    }

    return `${doc.doctor} is available on ${dayOfWeek} from ${hours.from} to ${hours.to}.`;
  },
  {
    name: "checkAvailability",
    description: "Use this tool to find out when a specific doctor is free on a given day of the week.",
    schema: z.object({
      doctorid: z.number().describe("The unique ID of the doctor, e.g., 1 for Dr. Smith or 2 for Dr. Alan"),
      doctorName: z.string().describe("The name of the doctor, e.g., 'Dr. Smith' or 'Dr. Alan'"),
      dayOfWeek: z.string().describe("The day of the week to check, e.g., 'saturday', 'monday'"),
    }),
  }
);

// 3. Tool 2: Stage & Schedule Appointment
const bookAppointment = tool(
  async ({ doctorid, doctorName, dayOfWeek, timeSlot, patientName }) => {
    // In a final step, this tool will dispatch a payload to your NestJS service/BullMQ queue.
    return `SUCCESS: Scheduled an appointment for patient "${patientName}" with ${doctorName} on ${dayOfWeek} at ${timeSlot}. This job has been safely queued.`;
  },
  {
    name: "bookAppointment",
    description: "Use this tool to finalize and lock in a specific appointment time slot once the user confirms it.",
    schema: z.object({
      doctorid: z.number().describe("The unique ID of the doctor, e.g., 1 for Dr. Smith or 2 for Dr. Alan"),
      doctorName: z.string().describe("The name of the doctor"),
      dayOfWeek: z.string().describe("The chosen day of the week"),
      timeSlot: z.string().describe("The specific requested time, e.g., '11:00 AM'"),
      patientName: z.string().describe("The name of the patient booking the slot"),
    }),
  }
);


export const receptionistAgent = createAgent({
  model: model, 
  tools: [checkAvailability, bookAppointment],
  name: "Receptionist Agent",
  systemPrompt: `
    You are an elite automated medical receptionist for a clinic. 
    Your job is to assist users in checking availability and booking appointments with doctors.
    Guidelines:
    1. ALWAYS check availability using the 'checkAvailability' tool before attempting to book a slot.
    2. If a user asks to book a time outside a doctor's available hours, politely inform them of the mismatch and offer alternative slots.
    3. Never finalize a booking without gathering the patient's name, day, and time slot.
    4. Be professional, direct, and empathetic.
  `,
});

// WORK-PIN(ce9b19c1-10dd-4f65-a5d9-bb7ff8f27e60): redis workflow for agents
