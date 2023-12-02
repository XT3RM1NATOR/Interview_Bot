import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { MyContext } from './config/session-config';
import { deleteAccountCommand, newDescriptionCommand, startCommand } from "./handlers/commandHandler";
import { adminHandler, intervieweeHandler, interviewerHandler, registrationHandler } from './handlers/responseHandler';
import { callbackQueryHandler } from "./service/registrationService";

dotenv.config();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', startCommand);
bot.command('deleteaccount', deleteAccountCommand);
bot.command('newdescription', newDescriptionCommand);

bot.hears('Интервьюер', interviewerHandler);
bot.hears('Собеседуемый', intervieweeHandler);
bot.hears('Админ', adminHandler);

bot.hears(/.*/, registrationHandler);

bot.on('callback_query', async (ctx) => {
  await callbackQueryHandler(ctx);
});

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

