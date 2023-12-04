import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { deleteAccountCommand, newDescriptionCommand, startCommand } from "./handlers/commandHandler";
import { getSlotsByDate, getSlotsForWeek, interviewRegistrationHandler, planHandler, slotCallbackHandler, timeSlotHandler } from './handlers/interviewHandler';
import { adminHandler, intervieweeHandler, interviewerHandler, registrationHandler, startAction } from './handlers/registrationHandler';
import { MyContext } from './resource/customTypes/MyContext';
import { callbackQueryHandler } from "./service/registrationService";

dotenv.config();

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.command('start', startCommand);
bot.command('deleteaccount', deleteAccountCommand);
bot.command('newdescription', newDescriptionCommand);

bot.action(["accept_nodejs", "accept_react", "accept_js"], startAction);
bot.action(/^select_slot_\d+_\d+$/, slotCallbackHandler);

bot.hears('Интервьюер', interviewerHandler);
bot.hears('Собеседуемый', intervieweeHandler);
bot.hears('Админ', adminHandler);
bot.hears('Сделать план на неделю', planHandler);
bot.hears("Зарегестрироваться на интервью", interviewRegistrationHandler);
bot.hears(/^(20\d{2}-\d{2}-\d{2})$/, getSlotsByDate);
bot.hears("Все слоты на неделю", getSlotsForWeek);
bot.hears(/([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})(?:\s+([А-Яа-я]+: \d{2}:\d{2}-\d{2}:\d{2})){0,6}/, timeSlotHandler);
bot.hears(/.*/, registrationHandler);

bot.on('callback_query', async (ctx) => {
  await callbackQueryHandler(ctx);
});

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

