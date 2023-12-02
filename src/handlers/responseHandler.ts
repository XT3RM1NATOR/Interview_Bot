import { User } from "../entity/User";
import { logAction } from '../logger/logger';
import { addUserToDatabase, changeDescription, getAdmins, isValidGMTFormat } from '../service/registrationService';
import { updateSessionDescription, updateSessionInterviewer, updateSessionRole, updateSessionStage, updateSessionTimezone, updateSessionsForUser } from '../service/sessionService';


export const adminHandler = async (ctx: any) => {
  ctx.session.stageId = 1;
  await updateSessionStage(ctx.session.id, 1);
  ctx.reply('Ты выбрал админа, введи пароль:');
}

export const interviewerHandler = async(ctx: any) => {
  ctx.session.interviewer = true;
  ctx.session.stageId = 2;
  await updateSessionStage(ctx.session.id, 2);
  await updateSessionInterviewer(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.stageId = 2;
  await updateSessionStage(ctx.session.id, 2);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

export const registrationHandler = async (ctx: any) => {
  switch (ctx.session?.stageId) {
    case undefined:
      ctx.reply("Сервер был перезагружен повторите сообщение");
      await updateSessionsForUser(ctx);
      break;

    case 1:
      if (ctx.message.text === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD) {
        ctx.session.stageId = 0;
        ctx.session.role = 'admin';
        await updateSessionStage(ctx.session.id, 0);
        await updateSessionRole(ctx.session.id, 'admin');

        const username = ctx.from?.username || "Default";
        const chat_id = ctx.chat.id;

        addUserToDatabase(username, "admin", chat_id);

        ctx.reply('Ты теперь админ');
      } else {
        ctx.reply('Введи правильный пароль');
      }
      break;

    case 2:
      if (isValidGMTFormat(ctx.message.text)) {
        ctx.session.timezone = ctx.message.text;
        ctx.session.stageId = 3;

        await updateSessionTimezone(ctx.session.id, ctx.message.text);
        await updateSessionStage(ctx.session.id, 3);

        ctx.reply("Введи краткое описание о себе для общей информации чем занимался и т.д.");
      } else {
        ctx.reply("Введи время в корректной форме");
      }
      break;

    case 3:
      ctx.session.description = ctx.message.text;
      ctx.session.stageId = 0;

      await updateSessionDescription(ctx.session.id, ctx.message.text);
      await updateSessionStage(ctx.session.id, 0);

      if (ctx.session.interviewer) {
        const user = await addUserToDatabase(ctx.from?.username || "Default", "interviewer", ctx.chat.id, ctx.session.timezone, ctx.session.description, false);
        if (!user) {
          ctx.reply("Регистрация не удалась");
        } else {
          ctx.reply("Ожидайте ответа админа");
          logAction(ctx.from?.username || "Default", "Has sent an application for the interviewer role")
          await sendMessagesToAdmins(ctx, user);
        }
      } else {
        ctx.reply("Ты успешно зарегистрировался");
        await addUserToDatabase(ctx.from?.username || "Default", "interviewee", ctx.chat.id, ctx.session.timezone, ctx.session.description, true);
      }
      break;

    case 4:
      ctx.session.stageId = 0;

      await updateSessionStage(ctx.session.id, 0);
      await changeDescription(ctx, ctx.message.chat.id, ctx.message.text);
      break;

    default:
      ctx.reply(`Команда пока не распознана`);
      break;
  }
};

export const sendMessagesToAdmins = async (ctx: any, user: User) => {
  try {
    const admins = await getAdmins();
    
    const options = [
      // Include two options under each message
      [{ text: '✅ Принять', callback_data: `accept_${user.id}` }, { text: '🚫 Отказать', callback_data: `reject${user.id}` }]
    ];

    const message = `👨🏻‍💻Заявка на интервьюера:\nЮзернейм: @${user.username}\nЧасовой пояс: GMT(${user.timezone})\nБио: ${user.description}`;
    
    if (admins) {
      for (const admin of admins) {
        const adminChatId = admin.chat_id;
  
        // Send the message to admins
        await ctx.telegram.sendMessage(adminChatId, message, {
          reply_markup: {
            inline_keyboard: options, 
          }
        });
      }
      console.log('Messages sent to all admins.');
    }
  } catch (err) {
    console.log(err);
  }
};

