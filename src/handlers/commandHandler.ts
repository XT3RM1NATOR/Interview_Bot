import dotenv from 'dotenv';
import { Markup } from 'telegraf';
import { checkServer } from '../service/messageService';
import { deleteAccount } from '../service/registrationService';
import { deleteSessionById, updateSessionStage } from '../service/sessionService';

dotenv.config();

export const newDescriptionCommand = async (ctx: any) => {
  if (ctx.session) {
    ctx.reply("Кидай новое описание");
    await updateSessionStage(ctx.session.id, 4);
  } else {
    ctx.reply("Для начала нажми /start");
  }
};

export const deleteAccountCommand = async (ctx: any) => {
  const chatId = ctx.message.chat.id;
  if (ctx.session?.id) await deleteSessionById(ctx.session.id);
  await deleteAccount(ctx, chatId);
};

export let messagesToDelete: any[];

export const startCommand = async (ctx: any) => {
  const check = await checkServer(ctx);
  if(check){
    messagesToDelete = [];
    const message1 = await ctx.replyWithHTML(
      `<a href="https://t.me/nodejs_ru">Node.js_ru</a>`,
      Markup.inlineKeyboard([
        Markup.button.callback('Выбрать', 'accept_nodejs'),
      ])
    );
    messagesToDelete.push(message1.message_id);

    const message2 = await ctx.replyWithHTML(
      `<a href="https://t.me/react_js">React_js</a>`,
      Markup.inlineKeyboard([
        Markup.button.callback('Выбрать', 'accept_react'),
      ])
    );
    messagesToDelete.push(message2.message_id);

    const message3 = await ctx.replyWithHTML(
      `<a href="https://t.me/js_ru">JavaScript</a>`,
      Markup.inlineKeyboard([
        Markup.button.callback('Выбрать', 'accept_js'),
      ])
    );
    messagesToDelete.push(message3.message_id);
  }
}

export const clearMessagesToDelete = () => {
  messagesToDelete = [];
};

