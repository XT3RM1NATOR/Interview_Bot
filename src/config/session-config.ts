import { Context } from 'telegraf';

interface SessionData {
  id: number;
  role: string;
  stageId: number;
  timezone_hour: number;
  timezone_minute: number;
  description: string;
  interviewer: boolean;
  chat_id: number;
}

export interface MyContext extends Context {
	session?: SessionData;
}