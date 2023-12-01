import dotenv from 'dotenv';
import { Context, Telegraf, session } from 'telegraf';
import { adminHandler, intervieweeHandler, interviewerHandler } from './handlers/handler';
import UserRepository from './repository/UserRepository';
import { Confirmation, Rejection, addUserToDatabase, changeDescription, deleteAccount, isValidGMTFormat, sendMessagesToAdmins } from './service/service';
import { deleteSessionById, saveNewSession, updateSessionAdminStage, updateSessionDescription, updateSessionDescriptionStage, updateSessionGmtStage, updateSessionNewDescriptionStage, updateSessionRole, updateSessionTimezone, updateSessionsForUser } from './service/sessionService';

dotenv.config({ path: '../.env' });

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

interface MyContext extends Context {
	session?: SessionData;
}

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

bot.hears(/^✅|^🚫/, async (ctx) => {
  if(!ctx.session){
    ctx.reply("Сервер был перезагружен повторите сообщение")
    await updateSessionsForUser(ctx);

  }else if (ctx.session?.role === "admin") {
    const id: number = parseInt(ctx.message.text.substring(1));
    const user = await UserRepository.findOne({ where: { id: id } });

    const options = [
      [`Сделать план на неделю`, `Проверить занятые слоты`]
    ];
    
    if (ctx.message.text.startsWith('✅') && user) {

      updateSessionRole(ctx.session.id, "interviewer");

      user.approved = true;
      await UserRepository.save(user);
      
      Confirmation(ctx, user.chat_id);
      ctx.reply("Юзер успешно одобрен!", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true, 
          resize_keyboard: true
        }
      });
    } else if(ctx.message.text.startsWith('🚫') && user){
      Rejection(ctx, user.chat_id);
      ctx.reply("Юзер успешно отказан!", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true, 
          resize_keyboard: true
        }
      });
    }
  } else {
    ctx.reply(`Ты не авторзован для команды`);
  }
});

bot.hears('Admin', adminHandler);
bot.hears('Interviewer', interviewerHandler);
bot.hears('Interviewee', intervieweeHandler);

bot.on('text', async (ctx) => {
  if(!ctx.session){
    ctx.reply("Сервер был перезагружен повторите сообщение")
    await updateSessionsForUser(ctx);
  }else if (ctx.session?.adminStage) {

    if(ctx.message.text === "123"){
      ctx.session.adminStage = false;
      ctx.session.role = 'admin';
      await updateSessionAdminStage(ctx.session.id, false);
      await updateSessionRole(ctx.session.id, 'admin');

      const username: string = ctx.from?.username || "Default"
      const chat_id = ctx.chat.id;

      addUserToDatabase(username, "admin", chat_id)

      ctx.reply('Ты теперь админ');
    } else{
      ctx.reply('Введи правильный пароль');
    }
    
  } else if(ctx.session?.gmtStage) {
    if(isValidGMTFormat(ctx.message.text)){
      ctx.session.gmtStage = false;
      ctx.session.timezone = ctx.message.text;
      ctx.session.descriptionStage = true;

      await updateSessionGmtStage(ctx.session.id, false);
      await updateSessionTimezone(ctx.session.id, ctx.message.text);
      await updateSessionDescriptionStage(ctx.session.id, true);

      ctx.reply("Введи краткое описание о себе для общей информации чем занимался и т д");
    } else {
      ctx.reply("Введи время в корректной форме");
    }
    
  } else if(ctx.session?.descriptionStage) {
    ctx.session.description = ctx.message.text;
    ctx.session.descriptionStage = false;

    await updateSessionDescription(ctx.session.id, ctx.message.text);
    await updateSessionDescriptionStage(ctx.session.id, false);

    const username: string = ctx.from?.username || "Default";
    const chat_id = ctx.chat.id;
    const timezone = ctx.session.timezone;
    const info = ctx.session.description;

    if(ctx.session.interviewer){
      const user = await addUserToDatabase(username, "interviewer", chat_id, timezone, info, false);
      if(!user){
        ctx.reply("Регистрация не вышла");
      } else{
        ctx.reply("Ожидайте ответа админа");
        await sendMessagesToAdmins(ctx, user);
      }
      
    } else {
      ctx.reply("Ты успешно зарегестрировался");
      await addUserToDatabase(username, "interviewee", chat_id, timezone, info, true);
    }
  } else if(ctx.session?.newDescriptionStage){
    const chatId = ctx.message.chat.id;
    const newDescription = ctx.message.text;
    ctx.session.newDescriptionStage = false;

    await updateSessionNewDescriptionStage(ctx.session.id, false);
    await changeDescription(ctx, chatId, newDescription);
  }else {
    ctx.reply(`Команда пока не распознана`);
  }
});

bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

