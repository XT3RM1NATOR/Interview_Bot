import { Context } from 'telegraf';

interface SessionData {
  id: number;
  role: string;
  stageId: number;
  timezone: string;
  description: string;
  interviewer: boolean;
  chat_id: number;
}

export interface MyContext extends Context {
	session?: SessionData;
}