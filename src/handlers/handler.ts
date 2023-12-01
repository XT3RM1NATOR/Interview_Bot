import UserRepository from '../repository/UserRepository';
import { Confirmation, Rejection, addUserToDatabase, changeDescription, isValidGMTFormat, sendMessagesToAdmins } from '../service/registrationService';
import { updateSessionAdminStage, updateSessionDescription, updateSessionDescriptionStage, updateSessionGmtStage, updateSessionInterviewer, updateSessionNewDescriptionStage, updateSessionRole, updateSessionTimezone, updateSessionsForUser } from '../service/sessionService';


export const adminHandler = async (ctx: any) => {
  ctx.session.adminStage = true;
  await updateSessionAdminStage(ctx.session.id, true);
  ctx.reply('Ты выбрал админа, введи пароль:');
}

export const interviewerHandler = async(ctx: any) => {
  ctx.session.interviewer = true;
  ctx.session.gmtStage = true;
  await updateSessionGmtStage(ctx.session.id, true);
  await updateSessionInterviewer(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.gmtStage = true;
  await updateSessionGmtStage(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

export const registrationHandler = async (ctx: any) => {
  if (!ctx.session) {
    ctx.reply("Сервер был перезагружен повторите сообщение");
    await updateSessionsForUser(ctx);
  } else if (ctx.session?.adminStage) {
    if (ctx.message.text === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD) {
      ctx.session.adminStage = false;
      ctx.session.role = 'admin';
      await updateSessionAdminStage(ctx.session.id, false);
      await updateSessionRole(ctx.session.id, 'admin');

      const username = ctx.from?.username || "Default";
      const chat_id = ctx.chat.id;

      addUserToDatabase(username, "admin", chat_id);

      ctx.reply('Ты теперь админ');
    } else {
      ctx.reply('Введи правильный пароль');
    }
  } else if (ctx.session?.gmtStage) {
    if (isValidGMTFormat(ctx.message.text)) {
      ctx.session.gmtStage = false;
      ctx.session.timezone = ctx.message.text;
      ctx.session.descriptionStage = true;

      await updateSessionGmtStage(ctx.session.id, false);
      await updateSessionTimezone(ctx.session.id, ctx.message.text);
      await updateSessionDescriptionStage(ctx.session.id, true);

      ctx.reply("Введи краткое описание о себе для общей информации чем занимался и т.д.");
    } else {
      ctx.reply("Введи время в корректной форме");
    }
  } else if (ctx.session?.descriptionStage) {
    ctx.session.description = ctx.message.text;
    ctx.session.descriptionStage = false;

    await updateSessionDescription(ctx.session.id, ctx.message.text);
    await updateSessionDescriptionStage(ctx.session.id, false);

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
        await sendMessagesToAdmins(ctx, user);
      }
    } else {
      ctx.reply("Ты успешно зарегистрировался");
      await addUserToDatabase(username, "interviewee", chat_id, timezone, info, true);
    }
  } else if (ctx.session?.newDescriptionStage) {
    const chatId = ctx.message.chat.id;
    const newDescription = ctx.message.text;
    ctx.session.newDescriptionStage = false;

    await updateSessionNewDescriptionStage(ctx.session.id, false);
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

