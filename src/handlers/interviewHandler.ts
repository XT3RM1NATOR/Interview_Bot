
import { Between, IsNull } from "typeorm";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { generateIntervieweeSlots, generateInterviewerSlots, generateSlots, getTemplateForCurrentWeek, handleTimeSlotInput } from "../service/interviewService";
import { checkServer } from "../service/messageService";
import { updateSessionStage } from "../service/sessionService";

export const planHandler = async (ctx:any) => {
  const check = await checkServer(ctx);
  if(check){
    const instructions = "Кидай в определенном формате ниже шаблон на эту неделю: (Время только ровное по 30 минут промежуткам, например 15:00 или 14:30)";
    ctx.reply(instructions);

    await updateSessionStage(ctx.session.id, 5);

    const templateForWeek = getTemplateForCurrentWeek();
    ctx.reply(`${templateForWeek}`);
  }
}

export const timeSlotHandler = async (ctx: any) => {
  const check = await checkServer(ctx);
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  if (session!.stageId === 5 && check) {
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
    const session = await SessionRepository.findOne({ where: { id: ctx.session.id }})
    if(check && session?.role === "interviewee"){
      const slots = await InterviewerSlotRepository.find();

      // Extract unique dates without time from start_time column
      const uniqueDates = Array.from(
        new Set(
          slots.map(slot => {
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
      const startDate = new Date(`${selectedDate}T00:00:00`);
      const endDate = new Date(`${selectedDate}T23:59:59`);

      const slots = await InterviewerSlotRepository.find({
        where: {
          start_time: Between(startDate, endDate),
          chat_id: session!.tg_chat_id,
          interviewee_id: IsNull()
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
      const slots = await InterviewerSlotRepository.find({ where: { interviewee_id: IsNull() } });
      console.log(slots);
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
  const callbackMessageId = ctx.callbackQuery.message.message_id;
  const chatId = ctx.callbackQuery.message.chat.id;
  
  const callbackData = ctx.callbackQuery.data;
  const regexPattern = /^select_slot_(\d+)_(\d+)$/;
  const match = callbackData.match(regexPattern);
  
  if (match) {
    const slotId = parseInt(match[1], 10);
    const intervieweeId = parseInt(match[2], 10);

    const slot = await InterviewerSlotRepository.findOne({ where: { id: slotId } });
    slot!.interviewee_id = intervieweeId;
    await InterviewerSlotRepository.save(slot!);
    ctx.reply("Слот с айди: " + slotId + " был удален");
    await ctx.telegram.deleteMessage(chatId, callbackMessageId);
  }
};

export const viewUserSlots = async(ctx: any) => {
  const check = await checkServer(ctx);
  if(check){

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
      const slot = await InterviewerSlotRepository.findOne({ where: { id: slotId }});

      if(slot){
        slot.interviewee_id = undefined;
        await InterviewerSlotRepository.save(slot);
      }
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

