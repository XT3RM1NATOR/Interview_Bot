import { logAction } from '../logger/logger';
import UserRepository from '../repository/UserRepository';
import { Confirmation, Rejection, addUserToDatabase, changeDescription, isValidGMTFormat, sendMessagesToAdmins } from '../service/registrationService';
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
  if (!ctx.session) {
    ctx.reply("Сервер был перезагружен повторите сообщение");
    await updateSessionsForUser(ctx);
  } else if (ctx.session?.stageId === 1) {
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
  } else if (ctx.session?.stageId === 2) {
    if (isValidGMTFormat(ctx.message.text)) {
      ctx.session.timezone = ctx.message.text;
      ctx.session.stageId = 3;

      await updateSessionTimezone(ctx.session.id, ctx.message.text);
      await updateSessionStage(ctx.session.id, 3);

      ctx.reply("Введи краткое описание о себе для общей информации чем занимался и т.д.");
    } else {
      ctx.reply("Введи время в корректной форме");
    }
  } else if (ctx.session?.stageId === 3) {
    ctx.session.description = ctx.message.text;
    ctx.session.stageId = 0;

    await updateSessionDescription(ctx.session.id, ctx.message.text);
    await updateSessionStage(ctx.session.id, 0);

    const username = ctx.from?.username || "Default";
    const chat_id = ctx.chat.id;
    const timezone = ctx.session.timezone;
    const info = ctx.session.description;

    if (ctx.session.interviewer) {
      const user = await addUserToDatabase(username, "interviewer", chat_id, timezone, info, false);
      if (!user) {
        ctx.reply("Регистрация не удалась");
      } else {
        ctx.reply("Ожидайте ответа админа");
        logAction(ctx.from?.username || "Default", "Has sent an application for the interviewer role")
        await sendMessagesToAdmins(ctx, user);
      }
    } else {
      ctx.reply("Ты успешно зарегистрировался");
      await addUserToDatabase(username, "interviewee", chat_id, timezone, info, true);
    }
  } else if (ctx.session?.stageId === 4) {
    const chatId = ctx.message.chat.id;
    const newDescription = ctx.message.text;
    ctx.session.stageId = 0;

    await updateSessionStage(ctx.session.id, 0);
    await changeDescription(ctx, chatId, newDescription);
  } else {
    ctx.reply(`Команда пока не распознана`);
  }
};

export const approveHandler = async (ctx: any) => {
  if (!ctx.session) {
    ctx.reply("Сервер был перезагружен повторите сообщение");
    await updateSessionsForUser(ctx);
  } else if (ctx.session?.role === "admin") {
    const id = parseInt(ctx.message.text.substring(1));
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
    } else if (ctx.message.text.startsWith('🚫') && user) {
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
    ctx.reply(`Ты не авторизован для команды`);
  }
};

