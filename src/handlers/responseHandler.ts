import { User } from "../entity/User";
import { case1, case2, case3 } from "../service/messageService";
import { changeDescription, getAdmins } from '../service/registrationService';
import { updateSessionInterviewer, updateSessionStage, updateSessionsForUser } from '../service/sessionService';


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
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" or "-4.30"');
};

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.stageId = 2;
  await updateSessionStage(ctx.session.id, 2);
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" or "-4.30"');
};

export const registrationHandler = async (ctx: any) => {
  switch (ctx.session?.stageId) {
    case undefined:
      ctx.reply("Сервер был перезагружен повторите сообщение");
      await updateSessionsForUser(ctx);
      break;

      case 1:
        await case1(ctx);
        break;
    case 2:
      await case2(ctx);
      break;

    case 3:
      await case3(ctx);
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

