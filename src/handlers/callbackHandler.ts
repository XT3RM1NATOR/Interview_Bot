import { logAction } from "../logger/logger";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import UserRepository from "../repository/UserRepository";

export const slotCallbackHandler = async (ctx: any) => {
  try{
    const callbackMessageId = ctx.callbackQuery.message.message_id;
    const chatId = ctx.callbackQuery.message.chat.id;

    const callbackData = ctx.callbackQuery.data;
    const regexPattern = /^select_slot_(\d+)_(\d+)$/;
    const match = callbackData.match(regexPattern);
    
    if (match) {
      const slotId = parseInt(match[1], 10);
      const intervieweeId = parseInt(match[2], 10);
      logAction(ctx.from?.username || "Default", `Has choosen the slot ${slotId}`);

      const slot = await InterviewerSlotRepository.findOne({ where: { id: slotId } });
      const user = await UserRepository.findOne({ where: { id: slot!.interviewer_id } });
      ctx.telegram.sendMessage(user?.chat_id, `🚀 Новый собеседуемый зарегестрировался 🚀`);

      slot!.interviewee_id = intervieweeId;
      await InterviewerSlotRepository.save(slot!);

      const newText = `${ctx.callbackQuery.message.text}\n\nСТАТУС: ❌ЗАНЯТ❌`;
      await ctx.telegram.editMessageText(chatId, callbackMessageId, null, newText);

      await ctx.telegram.editMessageReplyMarkup(chatId, callbackMessageId, null);
    }
  }catch(err){
    console.log(err);
  }
};

export const cancelSlotRegistrationCallbackHandler = async (ctx: any) => {
  try{
    const callbackMessageId = ctx.callbackQuery.message.message_id;
    const chatId = ctx.callbackQuery.message.chat.id;
    const callbackData = ctx.callbackQuery.data;
    const regexPattern = /^cancel_slot_(\d+)_(\d+)$/;
    const match = callbackData.match(regexPattern);

    if (match) {
      const slotId = parseInt(match[1], 10);
      logAction(ctx.from?.username || "Default", `Has cancelled his registration for the slot ${slotId}`);
      const slot = await InterviewerSlotRepository.findOne({ where: { id: slotId }});
      if(slot){
        await InterviewerSlotRepository.remove(slot);
        slot.interviewee_id = undefined;
        await InterviewerSlotRepository.save(slot);
      }

      const user = await UserRepository.findOne({ where: { id: slot!.interviewer_id } });
      ctx.telegram.sendMessage(user!.chat_id, `❌ Собеседуемый отменил регистарцию. ❌`);

      ctx.reply("Слот с айди: " + slotId + " был удален");
      await ctx.telegram.deleteMessage(chatId, callbackMessageId);
  }
  }catch(err){
    console.log(err);
    ctx.reply("Произошла ошибка удаления регистрации");
  }
};

export const cancelSlotCallbackHandler = async (ctx: any) => {
  try{
    logAction(ctx.from?.username || "Default", `Has cancelled his slot`);
    const callbackMessageId = ctx.callbackQuery.message.message_id;
    const chatId = ctx.callbackQuery.message.chat.id;
    const callbackData = ctx.callbackQuery.data;
    const regexPattern = /^cancel_slot_(\d+)$/;

    const match = callbackData.match(regexPattern);

    if (match) {
      const slotId = parseInt(match[1], 10);
      const slot = await InterviewerSlotRepository.findOne({ where: { id: slotId }});

      if(slot) await InterviewerSlotRepository.remove(slot);

      ctx.reply("Слот с айди: " + slotId + " был удален");
      await ctx.telegram.deleteMessage(chatId, callbackMessageId);
  }
  }catch(err){
    console.log(err);
    ctx.reply("Произошла ошибка удаления слота");
  }
};



