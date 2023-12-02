import { sendMessagesToAdmins } from "../handlers/responseHandler";
import { logAction } from '../logger/logger';
import { addUserToDatabase, isValidGMTFormat } from '../service/registrationService';
import { updateSessionDescription, updateSessionRole, updateSessionStage, updateSessionTimezone } from '../service/sessionService';

export const case3 = async(ctx: any) => {
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
}

export const case2 = async(ctx: any) => {
  if (isValidGMTFormat(ctx.message.text)) {
    ctx.session.timezone = ctx.message.text;
    ctx.session.stageId = 3;

    await updateSessionTimezone(ctx.session.id, ctx.message.text);
    await updateSessionStage(ctx.session.id, 3);

    ctx.reply("Введи краткое описание о себе для общей информации чем занимался и т.д.");
  } else {
    ctx.reply("Введи время в корректной форме");
  }
}

export const case1 = async(ctx: any) => {
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
}