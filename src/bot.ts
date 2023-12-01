import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { MyContext } from './config/session-config';
import { deleteAccountCommand, newDescriptionCommand, startCommand } from "./handlers/commandHandler";
import { adminHandler, intervieweeHandler, interviewerHandler, processEmojiMessages, registrationHandler } from './handlers/handler';

dotenv.config({ path: '../.env' });

const bot = new Telegraf<MyContext>("6961764510:AAG9nxdNlrCTN1bIsjiC53PqXoy4-q5YPEc");

bot.use(session());

bot.command('start', startCommand);
bot.command('newdescription', newDescriptionCommand);
bot.command('deleteaccount', deleteAccountCommand);

bot.hears('Admin', adminHandler);
bot.hears('Interviewer', interviewerHandler);
bot.hears('Interviewee', intervieweeHandler);
bot.hears(/^✅|^🚫/, processEmojiMessages);
bot.hears(/.*/, registrationHandler);

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

