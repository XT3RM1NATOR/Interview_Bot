import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { MyContext } from './config/session-config';
import { adminHandler, intervieweeHandler, interviewerHandler, processEmojiMessages, registrationHandler } from './handlers/handler';
import { deleteAccount } from './service/registrationService';
import { deleteSessionById, saveNewSession, updateSessionNewDescriptionStage } from './service/sessionService';

dotenv.config({ path: '../.env' });



const bot = new Telegraf<MyContext>("6961764510:AAG9nxdNlrCTN1bIsjiC53PqXoy4-q5YPEc");

bot.use(session());

bot.command('start', async (ctx) => {
  const session = await saveNewSession(ctx, ctx.chat.id);

  if(session){
    ctx.session ??= { 
      id: session.id,
      role: "",
      adminStage: false,
      timezone: "",
      description: "",
      gmtStage: false,
      descriptionStage: false,
      interviewer:false,
      newDescriptionStage: false,
      chat_id: ctx.chat.id
     };
  }
  
  const options = [
    ['Admin', 'Interviewer', 'Interviewee']
  ];

  ctx.reply('Please select an option:', {
    reply_markup: {
      keyboard: options,
      one_time_keyboard: true, // Hide the keyboard after a choice is made
      resize_keyboard: true // Allow the keyboard to be resized by the user
    }
  });
});

bot.command('newdescription', async (ctx) => {
  if(ctx.session) { ctx.session.newDescriptionStage = true; ctx.reply("Кидай новое описание");  await updateSessionNewDescriptionStage(ctx.session.id, true);}
  else ctx.reply("Для начала нажми /start")
});

bot.command('deleteaccount', async (ctx) => {
  const chatId = ctx.message.chat.id;
  if(ctx.session?.id) await deleteSessionById(ctx.session.id);
  await deleteAccount(ctx, chatId);
});

bot.hears('Admin', adminHandler);
bot.hears('Interviewer', interviewerHandler);
bot.hears('Interviewee', intervieweeHandler);
bot.hears(/^✅|^🚫/, processEmojiMessages);
bot.hears(/.*/, registrationHandler);

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

