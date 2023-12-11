import { sendMessagesToAdmins } from "../handlers/registrationHandler";
import { logAction } from '../logger/logger';
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { addUserToDatabase, isValidGMTFormat } from '../service/registrationService';
import { updateSessionDescription, updateSessionRole, updateSessionStage, updateSessionTimezone } from '../service/sessionService';

export const case3 = async(ctx: any) => {
  await updateSessionDescription(ctx.session.id, ctx.message.text);
  await updateSessionStage(ctx.session.id, 0);
  const session = await SessionRepository.findOne({where: {id: ctx.session.id}});

  if (session!.interviewer) {
    const user = await addUserToDatabase(ctx.from?.username || "Default", "interviewer", ctx.chat.id, session!.tg_chat_id,  session!.timezone_hour, session!.timezone_minute, session!.description, false);
    if (!user) {
      ctx.reply("Регистрация не удалась");
    } else {
      ctx.reply("Ожидайте ответа админа");
      logAction(ctx.from?.username || "Default", "Has sent an application for the interviewer role");
      await sendMessagesToAdmins(ctx, user);
    }
  }else if(session!.role === "admin"){

    const options = [
      [`Сделать план на неделю`, `Посмотреть мои слоты`, `Сделать объявление`],
      ['Все слоты на неделю']
    ];

    ctx.reply("Ты успешно зарегистрировался! Что теперь?", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });

    await addUserToDatabase(ctx.from?.username || "Default", "admin", ctx.chat.id, session!.tg_chat_id, session!.timezone_hour, session!.timezone_minute, session!.description, true);
  }else {
    const options = [
      [`Зарегестрироваться на интервью`, `Посмотреть мои слоты`]
    ];

    ctx.reply("Ты успешно зарегистрировался! Что теперь?", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true, 
        resize_keyboard: true
      }
    });

    await updateSessionRole(ctx.session.id, "interviewee");
    await addUserToDatabase(ctx.from?.username || "Default", "interviewee", ctx.chat.id, session!.tg_chat_id, session!.timezone_hour, session!.timezone_minute, session!.description, true);
  }
};

export const case2 = async(ctx: any) => {
  if (isValidGMTFormat(ctx.message.text)) {
    await updateSessionTimezone(ctx.session.id, ctx.message.text);
    await updateSessionStage(ctx.session.id, 3);

    ctx.reply("Введи краткое описание о себе. Для общей информации чем занимался и т.д.");
  } else {
    ctx.reply("Введи время в корректной форме");
  }
};

export const case1 = async(ctx: any) => {
  if (ctx.message.text === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD) {
    await updateSessionStage(ctx.session.id, 2);
    await updateSessionRole(ctx.session.id, 'admin');

    ctx.reply('Ты теперь админ! Напиши часовой пояс GMT (твоего местонахождения) в формате "5" или "-4.30" ');
  } else {
    ctx.reply('Введи правильный пароль');
  }
};

export const checkServer = async (ctx: any) => {
  try{
    if(ctx.session === undefined){
      const session = await SessionRepository.findOne( { where: { chat_id: ctx.chat.id } } );
      if(session){
        ctx.session = session.id;
        return true;
      }else{
        ctx.reply("У вас нет аккаунта. /start");
        return false;
      }
    }
    return true
  }catch(err){
    console.log(err);
  }
};

export const broadcastMessageToAllUsers = async (ctx: any) => {
  try {
    const users = await UserRepository.find();
    const message = ctx.message.text;
    for (const user of users) {
      if(user.chat_id === ctx.chat.id) continue;
      await ctx.telegram.sendMessage(user.chat_id, message); // Send the message to each user
    }

    const options = [
      [`Сделать план на неделю`, `Посмотреть мои слоты`, `Сделать объявление`],
      ['Все слоты на неделю']
    ];

    ctx.reply("Сообщение отправлено всем юзерам", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });

  } catch (error) {
    console.error("Error broadcasting message:", error);
  }
};