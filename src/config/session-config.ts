import { Context } from 'telegraf';

interface SessionData {
  id: number;
}

export interface MyContext extends Context {
	session?: SessionData;
}