
import { Between } from "typeorm";
import { logAction } from "../logger/logger";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { generateIntervieweeSlots, generateInterviewerSlots, generateSlots, getTemplateForCurrentWeek, handleTimeSlotInput } from "../service/interviewService";
import { checkServer } from "../service/messageService";
import { updateSessionStage } from "../service/sessionService";

export const planHandler = async (ctx:any) => {
  const check = await checkServer(ctx);
  if(check){
    logAction(ctx.from?.username || "Default", "Has initiated a week planner");
    const instructions = "Кидай в определенном формате ниже шаблон на эту неделю: (Время только ровное по 30 минут промежуткам, например 15:00 или 14:30)";
    const options = [
      [`Домой`]
    ];

    ctx.reply(instructions, {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });

    await updateSessionStage(ctx.session.id, 5);

    const templateForWeek = getTemplateForCurrentWeek();
    ctx.reply(`${templateForWeek}`);
  }
}

export const timeSlotHandler = async (ctx: any) => {
  const check = await checkServer(ctx);
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  if (session!.stageId === 5 && check) {
    logAction(ctx.from?.username || "Default", "Has sent the new week plan");
    await updateSessionStage(ctx.session.id, 0);
    const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

    const input = ctx.message.text;
    const lines = input.trim().split('\n');

    let invalidInput = false;

    lines.forEach((line: any) => {
      const [day, timeRange] = line.split(': ');

      const dayTrimmed = day.trim();
      const timeRangePattern = /^\d\d:\d\d-\d\d:\d\d$/;

      if (
        !daysOfWeek.includes(dayTrimmed) ||
        !timeRangePattern.test(timeRange.trim())
      ) {
        invalidInput = true;
      }
    });

    if (invalidInput) {
      ctx.reply("Неправильный формат времени");
    } else {
      handleTimeSlotInput(ctx);
    }
  } else {
    ctx.reply("Вы не авторизованы для команды или сервер был перезагружен. Повторите сообщение");
  }
};

export const interviewRegistrationHandler = async (ctx: any) => {
  try {
    const check = await checkServer(ctx);
    const session = await SessionRepository.findOne({ where: { id: ctx.session.id } });
    if (check && session!.role === "interviewee") {
      logAction(ctx.from?.username || "Default", "Has started choosing the slot date");
      const slots = await InterviewerSlotRepository.find();

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Filter slots for today, yesterday, and future dates
      const filteredSlots = slots.filter(slot => {
        const slotDate = new Date(slot.start_time).setHours(0, 0, 0, 0);
        return slotDate >= yesterday.getTime(); // Filter dates equal to or after yesterday
      });

      const uniqueDates = Array.from(
        new Set(
          filteredSlots.map(slot => {
            const date = new Date(slot.start_time);
            return date.toISOString().split("T")[0];
          })
        )
      );

      uniqueDates.push("Все слоты на неделю");

      const options = uniqueDates.map(date => [{ text: date }]);

      ctx.reply("Выберите подходящий вариант:", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  } catch (error) {
    // Handle errors
    console.error("Error fetching interview slots:", error);
    ctx.reply("Произошла ошибка при загрузке слотов для интервью. Попробуйте позже");
  }
};


export const getSlotsByDate = async (ctx: any) => {
  const check = await checkServer(ctx);
  const selectedDate = ctx.match[1];
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  try {
    if(check){
      logAction(ctx.from?.username || "Default", "Has chosen an exact date");
      const startDate = new Date(`${selectedDate}T00:00:00`);
      const endDate = new Date(`${selectedDate}T23:59:59`);

      const slots = await InterviewerSlotRepository.find({
        where: {
          start_time: Between(startDate, endDate),
          chat_id: session!.tg_chat_id,
        },
      });

      if(slots){
        await generateSlots(ctx, slots, session!);

        const options = [
          [`Домой`]
        ];
    
        ctx.reply("Выберите слот", {
          reply_markup: {
            keyboard: options,
            one_time_keyboard: true, 
            resize_keyboard: true
          }
        });
      } else {
        ctx.reply("В вашем чате на эту дату нет свободных слотов");
      }
    }
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    ctx.reply("There was an error fetching slots for the specified date.");
  }
};


export const getSlotsForWeek =  async (ctx: any) => {
  const check = await checkServer(ctx);
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  try {
    if(check){
      logAction(ctx.from?.username || "Default", "Has chosen to generate slots for the whole week");
      const slots = await InterviewerSlotRepository.find();
      if(slots){
        await generateSlots(ctx, slots, session!);

        const options = [
          [`Домой`]
        ];
    
        ctx.reply("Выберите слот", {
          reply_markup: {
            keyboard: options,
            one_time_keyboard: true,
            resize_keyboard: true
          }
        });
      } else {
        ctx.reply("В вашем чате на эту дату нет свободных слотов")
      }
    }
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    ctx.reply("Произошла ошибка при получени слотов на неделю");
  }
}

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

export const viewUserSlots = async(ctx: any) => {
  const check = await checkServer(ctx);
  if(check){
    logAction(ctx.from?.username || "Default", `Has choosen to view his registered slots`);
    const session = await SessionRepository.findOne({where: {id: ctx.session.id}});
    const user = await UserRepository.findOne({where:{chat_id: session!.chat_id}})

    if(session!.role === "interviewee"){

      const options = [
        [`Домой`]
      ];
  
      ctx.reply("Ваши слоты", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });

      const slots = await InterviewerSlotRepository.find({where: {interviewee_id: user!.id}});
      await generateIntervieweeSlots(ctx, slots, session!, user!);
    }else{

      const options = [
        [`Домой`]
      ];
  
      ctx.reply("Ваши слоты", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });

      const slots = await InterviewerSlotRepository.find({where: {interviewer_id: user!.id}});
      await generateInterviewerSlots(ctx, slots, session!);
    }
  }
}

export const cancellSlotRegistrationCallbackHandler = async (ctx: any) => {
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

export const cancellSlotCallbackHandler = async (ctx: any) => {
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

export const returnUserToMain = async(ctx: any) => {
  const check = await checkServer(ctx);
  if(check){
    logAction(ctx.from?.username || "Default", `Has gone to the main view`);
    const session = await SessionRepository.findOne({where: {id: ctx.session.id}})

    if(session!.role === "interviewee"){
      const options = [
        [`Зарегестрироваться на интервью`, `Посмотреть мои слоты`]
      ];
    
      ctx.reply("Вы вернулись обратно", {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }else if(session!.role === "admin"){
      const options = [
        ['Сделать план на неделю', 'Посмотреть мои слоты', 'Cделать объявление'],
        ['Все слоты на неделю']
      ];

      ctx.reply('Вы вернулись обратно', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }else{
      const options = [
        ['Сделать план на неделю', 'Посмотреть мои слоты']
      ];

      ctx.reply('Вы вернулись обратно', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  }
}

