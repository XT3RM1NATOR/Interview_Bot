import dotenv from 'dotenv';
import { Markup } from 'telegraf';
import { logAction } from '../logger/logger';
import { MyContext } from '../resource/customTypes/MyContext';
import { checkServer } from '../service/messageService';
import { checkUser, deleteAccount } from '../service/registrationService';
import { deleteSessionById, updateSessionStage } from '../service/sessionService';

dotenv.config();

export const newDescriptionCommand = async (ctx: any) => {
  const check = await checkServer(ctx);
  if (check) {
    logAction(ctx.from?.username || "Default", "Has changed the description");
    ctx.reply("Кидай новое описание");
    await updateSessionStage(ctx.session.id, 4);
  } else {
    ctx.reply("Для начала нажми /start или повтори комманду");
  }
};

export const deleteAccountCommand = async (ctx: any) => {
  const check = await checkServer(ctx);
  if(check){
    logAction(ctx.from?.username || "Default", "Has deleted the account");
    const chatId = ctx.message.chat.id;
    if (ctx.session?.id) await deleteSessionById(ctx.session.id);
    await deleteAccount(ctx, chatId);
  }
};

export let messagesToDelete: any[];

export const startCommand = async (ctx: any) => {
  const user = await checkUser(ctx);

  if(user) {
    logAction(ctx.from?.username || "Default", "Has to create an account while having one");
    if(user.role === 'interviewee'){
      const options = [
        [`Зарегестрироваться на интервью`, `Посмотреть мои слоты`]
      ];

      ctx.reply('Вы уже зарегестрированы что бы удалить аккаунт нажмите /deleteaccount', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }else if(user.role === 'admin'){
      const options = [
        ['Сделать план на неделю', 'Посмотреть мои слоты', 'Сделать объявление'],
        ['Все слоты на неделю']
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
    logAction(ctx.from?.username || "Default", "Has started the account");
    messagesToDelete = [];
    const message1 = await ctx.replyWithHTML(
      `<a href="https://t.me/nodejs_ru">Node.js_ru</a>`,
      Markup.inlineKeyboard([
        Markup.button.callback('Выбрать', 'accept_nodejs'),
      ])
    );
    messagesToDelete.push(message1.message_id);

    // const message2 = await ctx.replyWithHTML(
    //   `<a href="https://t.me/react_js">React_js</a>`,
    //   Markup.inlineKeyboard([
    //     Markup.button.callback('Выбрать', 'accept_react'),
    //   ])
    // );
    // messagesToDelete.push(message2.message_id);

    // const message3 = await ctx.replyWithHTML(
    //   `<a href="https://t.me/js_ru">JavaScript</a>`,
    //   Markup.inlineKeyboard([
    //     Markup.button.callback('Выбрать', 'accept_js'),
    //   ])
    // );
    // messagesToDelete.push(message3.message_id);
  }
}

export const changeChatCommand = async (ctx: MyContext) => {
  const check = await checkServer(ctx);
  if(check){
    messagesToDelete = [];
    const message1 = await ctx.replyWithHTML(
      `<a href="https://t.me/nodejs_ru">Node.js_ru</a>`,
      Markup.inlineKeyboard([
        Markup.button.callback('Выбрать', 'accept_nodejs_change'),
      ])
    );
    messagesToDelete.push(message1.message_id);

    // const message2 = await ctx.replyWithHTML(
    //   `<a href="https://t.me/react_js">React_js</a>`,
    //   Markup.inlineKeyboard([
    //     Markup.button.callback('Выбрать', 'accept_react_change'),
    //   ])
    // );
    // messagesToDelete.push(message2.message_id);

    // const message3 = await ctx.replyWithHTML(
    //   `<a href="https://t.me/js_ru">JavaScript</a>`,
    //   Markup.inlineKeyboard([
    //     Markup.button.callback('Выбрать', 'accept_js_change'),
    //   ])
    // );
    // messagesToDelete.push(message3.message_id);
  }
}

export const changeGMTCommand = async (ctx: any) => {
  const check = await checkServer(ctx);
  if (check) {
    logAction(ctx.from?.username || "Default", "Has changed the GMT Timezone");
    await updateSessionStage(ctx.session.id, 7);
    ctx.reply("Кидай новый часовой пояс");
  } else {
    ctx.reply("Для начала нажми /start или повтори комманду");
  }
}

export const clearMessagesToDelete = () => {
  messagesToDelete = [];
};