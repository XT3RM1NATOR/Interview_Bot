import { User } from "../entity/User";
import { case1, case2, case3, checkServer } from "../service/messageService";
import { changeDescription, checkUser, getAdmins } from '../service/registrationService';
import { saveNewSession, updateSessionInterviewer, updateSessionStage } from '../service/sessionService';
import { clearMessagesToDelete, messagesToDelete } from "./commandHandler";


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
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" или "-4.30"');
};

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.stageId = 2;
  await updateSessionStage(ctx.session.id, 2);
  ctx.reply('Напиши часовой пояс GMT (твоего местонахождения) в формате "5" или "-4:30"');
};

export const registrationHandler = async (ctx: any) => {
  switch (ctx.session?.stageId) {
    case undefined:
      await checkServer(ctx);
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

export const startAction= async (ctx: any) => {

  const user = await checkUser(ctx);

  if(user) {
    if(user.role === 'interviewee'){
      ctx.reply("poop")
    }else {
      const options = [
        ['Сделать план на неделю', 'Проверить занятые слоты']
      ];

      ctx.reply('Вы уже зарегестрированы что бы удалить аккаунт нажмите /deleteaccount', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  }else{

    const session = await saveNewSession(ctx, ctx.chat.id);
    
    if (session) {
      ctx.session ??= {
        id: session.id,
        role: "",
        stageId: 0,
        timezone_hour: 0,
        timezone_minute: 0,
        description: "",
        interviewer: false,
        chat_id: ctx.chat.id,
        tg_chat_id: 0
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
  }

  for (const messageId of messagesToDelete) {
    await ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch(console.error);
  };

  clearMessagesToDelete();
};
