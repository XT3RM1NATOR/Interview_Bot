import { Context } from 'telegraf';

interface SessionData {
  id: number;
  role: string;
  adminStage: boolean;
  descriptionStage: boolean
  gmtStage: boolean;
  timezone: string;
  description: string;
  interviewer: boolean;
  newDescriptionStage: boolean;
  chat_id: number;
}

export interface MyContext extends Context {
	session?: SessionData;
}