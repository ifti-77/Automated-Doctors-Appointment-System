import { Chamber } from 'src/entities/chamber.entity';

export enum UserRole {
  DOCTOR = 'doctor',
  Patient = 'patient',
}

export enum DayOfWeek {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

export interface AgentResponseType {
  success: boolean;
  userMessage: string;
  stepsTaken: {
    tool: string;
    arguments: Record<string, any>;
    result: string;
  }[];
  finalReply: string;
}

export interface DoctorDetailsForAgent {
  name: string;
  specialization: string;
  contact_info: string;
  chambers: Chamber[];
}
