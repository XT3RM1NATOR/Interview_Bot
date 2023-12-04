import { Context } from 'telegraf';
import { SessionData } from '../../config/session-config';

export interface MyContext extends Context {
	session?: SessionData;
}