import { sendMessagesToAdmins } from "../handlers/registrationHandler";
import { logAction } from '../logger/logger';
import { addUserToDatabase, convertStringToNumbers, isValidGMTFormat } from '../service/registrationService';
import { updateSessionDescription, updateSessionRole, updateSessionStage, updateSessionTimezone } from '../service/sessionService';

export const case3 = async(ctx: any) => {
  ctx.session.description = ctx.message.text;
  ctx.session.stageId = 0;

  await updateSessionDescription(ctx.session.id, ctx.message.text);
  await updateSessionStage(ctx.session.id, 0);

  if (ctx.session.interviewer) {
    const user = await addUserToDatabase(ctx.from?.username || "Default", "interviewer", ctx.chat.id, ctx.session.timezone_hour, ctx.session.timezone_minute, ctx.session.description, false);
    if (!user) {
      ctx.reply("Регистрация не удалась");
    } else {
      ctx.reply("Ожидайте ответа админа");
      logAction(ctx.from?.username || "Default", "Has sent an application for the interviewer role")
      await sendMessagesToAdmins(ctx, user);
    }
  }else if(ctx.session.role === "admin"){

    const options = [
      [`Сделать план на неделю`, `Проверить занятые слоты`]
    ];

    ctx.reply("Ты успешно зарегистрировался! Что теперь?", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true, 
        resize_keyboard: true
      }
    });

    await addUserToDatabase(ctx.from?.username || "Default", "admin", ctx.chat.id, ctx.session.timezone_hour, ctx.session.timezone_hour, ctx.session.description, true);
  }else {
    ctx.reply("Ты успешно зарегистрировался");
    await addUserToDatabase(ctx.from?.username || "Default", "interviewee", ctx.chat.id,ctx.session.timezone_hour, ctx.session.timezone_hour, ctx.session.description, true);
  }
}

export const case2 = async(ctx: any) => {
  if (isValidGMTFormat(ctx.message.text)) {
    const timezone = convertStringToNumbers(ctx.message.text);

    if(timezone){
      ctx.session.timezone_hour = timezone[0];
      ctx.session.timezone_minute = timezone[1];
    }

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
    ctx.session.stageId = 2;
    ctx.session.role = 'admin';
    await updateSessionStage(ctx.session.id, 2);
    await updateSessionRole(ctx.session.id, 'admin');

    ctx.reply('Ты теперь админ! Теперь напиши часовой пояс GMT (твоего местонахождения) в формате "5" or "-4.30" ');
  } else {
    ctx.reply('Введи правильный пароль');
  }
}