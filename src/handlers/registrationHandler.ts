import { User } from "../entity/User";
import { logAction } from "../logger/logger";
import SessionRepository from "../repository/SessionRepository";
import { case1, case2, case3, checkServer } from "../service/messageService";
import { acceptCallback, changeDescription, changeGMT, getAdmins, rejectCallback, updateUserChat } from '../service/registrationService';
import { saveNewSession, updateSessionInterviewer, updateSessionStage } from '../service/sessionService';
import { clearMessagesToDelete, messagesToDelete } from "./commandHandler";


export const adminHandler = async (ctx: any) => {
  await updateSessionStage(ctx.session.id, 1);
  ctx.reply('Ты выбрал админа, введи пароль:');
}

export const interviewerHandler = async(ctx: any) => {
  await updateSessionStage(ctx.session.id, 2);
  await updateSessionInterviewer(ctx.session.id, true);
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" или "-4.30"');
};

export const intervieweeHandler = async (ctx: any) => {
  await updateSessionStage(ctx.session.id, 2);
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" или "-4:30"');
};

export const registrationHandler = async (ctx: any) => {
  const session = await SessionRepository.findOne({where: { chat_id: ctx.chat.id }});
  if(!session || !session.stageId) checkServer(ctx);
  switch (session?.stageId) {
    case 1:
      logAction(ctx.from?.username || "Default", `Has chosen his tier/type`);
      await case1(ctx);
      break; 
    case 2:
      logAction(ctx.from?.username || "Default", `Has chosen his gmt timezone`);
      await case2(ctx);
      break;
    case 3:
      logAction(ctx.from?.username || "Default", `Has chosen his description`);
      await case3(ctx);
      break;
    case 4:
      logAction(ctx.from?.username || "Default", `Has chosen his new description`);
      await updateSessionStage(ctx.session.id, 0);
      await changeDescription(ctx, ctx.message.chat.id, ctx.message.text);
      break;
    case 7:
      logAction(ctx.from?.username || "Default", `Has chosen his new gmt timezone`);
      await changeGMT(ctx, ctx.chat.id);
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

    const message = `👨🏻‍💻Заявка на интервьюера:\nЮзернейм: @${user.username}\nЧасовой пояс: GMT(${user.timezone_hour}:(${user.timezone_minute})\nБио: ${user.description}`;
    
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

export const startAction = async (ctx: any) => {
  const tg_chat_id = ctx.match[0] == "accept_nodejs" ? 1 : ctx.match[0] == "accept_react" ? 2 : ctx.match[0] == "accept_react" ? 3 : 0;
  const session = await saveNewSession(ctx, ctx.chat.id, tg_chat_id);

  if (session) {
    ctx.session ??= {
      id: session.id
    };
  }
  
  const options = [
    ['Админ', 'Интервьюер', 'Собеседуемый']
  ];

  ctx.reply('Выбери подходящий вариант:', {
    reply_markup: {
      keyboard: options,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });

  for (const messageId of messagesToDelete) {
    await ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch(console.error);
  };

  clearMessagesToDelete();
};

export const changeChatCallbackHandler = async (ctx:any) => {
  const tg_chat_id = ctx.match[0] == "accept_nodejs_change" ? 1 : ctx.match[0] == "accept_react_change" ? 2 : ctx.match[0] == "accept_js_change" ? 3 : 0;
  const session = await SessionRepository.findOne({ where: {id: ctx.session.id}})
  await updateUserChat(session!.chat_id, tg_chat_id);

  for (const messageId of messagesToDelete) {
    await ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch(console.error);
  };

  clearMessagesToDelete();
}

export const newInterviewerCallbackHandler = async (ctx: any) => {
  try {
    const data = ctx.callbackQuery.data;
    const userId = parseInt(data.split('_')[1]); // Extract the user ID from callback_data
    console.log(userId);
    if (data.startsWith('accept')) {
      await acceptCallback(ctx, userId);
    } else if (data.startsWith('reject')) {
      await rejectCallback(ctx, userId);
    }
  } catch (err) {
    console.log(err);
    ctx.reply("Произошла ошибка при обновлении статуса интервьюера")
  }
};
