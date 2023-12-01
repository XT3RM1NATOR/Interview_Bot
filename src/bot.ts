import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { MyContext } from './config/session-config';
import { deleteAccountCommand, newDescriptionCommand, startCommand } from "./handlers/commandHandler";
import { adminHandler, approveHandler, intervieweeHandler, interviewerHandler, registrationHandler } from './handlers/handler';

dotenv.config();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', startCommand);
bot.command('deleteaccount', deleteAccountCommand);
bot.command('newdescription', newDescriptionCommand);

bot.hears('Интервьюер', interviewerHandler);
bot.hears('Собеседуемый', intervieweeHandler);
bot.hears(/^✅|^🚫/, approveHandler);
bot.hears('Админ', adminHandler);

bot.hears(/.*/, registrationHandler);

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

