
import { Between } from "typeorm";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { getTemplateForCurrentWeek, handleTimeSlotInput } from "../service/interviewService";
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
    ctx.reply("Вы не авторизованы для команды или не прошли правильно");
  }
};

export const interviewRegistrationHandler = async (ctx: any) => {
  try {
    // Fetch all interview slots
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

  } catch (error) {
    // Handle errors
    console.error("Error fetching interview slots:", error);
    ctx.reply("Произошла ошибка при загрузке слотов для интервью. Попробуйте позже");
  }
};

export const getSlotsByDate = async (ctx: any) => {
  const selectedDate = ctx.match[1];
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  try {
    const startDate = new Date(`${selectedDate}T00:00:00`);
    const endDate = new Date(`${selectedDate}T23:59:59`);

    const slots = await InterviewerSlotRepository.find({
      where: {
        start_time: Between(startDate, endDate),
        chat_id: session!.tg_chat_id
      },
    });

    if(slots){
      for (const slot of slots) {
        const interviewer = await UserRepository.findOne({where: { id: slot.interviewer_id }});
        const user = await UserRepository.findOne({where: { chat_id: session!.chat_id }});
  
        const startTime = slot.start_time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const endTime = slot.end_time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
        const message = `ID: ${slot.id}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
        
        await ctx.reply(message, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅', callback_data: `select_slot_${slot.id}_${user?.id}` }]
            ]
          }
        });
      }
    } else {
      ctx.reply("В вашем чате на эту дату нет свободных слотов")
    }
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    ctx.reply("There was an error fetching slots for the specified date.");
  }
};


export const getSlotsForWeek =  async (ctx: any) => {
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  try {

    const slots = await InterviewerSlotRepository.find();

    if(slots){
      for (const slot of slots) {
        const interviewer = await UserRepository.findOne({where: { id: slot.interviewer_id }});
        const user = await UserRepository.findOne({where: { chat_id: session!.chat_id }});
  
        const startTime = slot.start_time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const endTime = slot.end_time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
        const message = `ID: ${slot.id}\nДата: ${slot.start_time.toISOString().slice(0, 10)}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
        
        await ctx.reply(message, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅', callback_data: `select_slot_${slot.id}_${user?.id}` }]
            ]
          }
        });
      }
    } else {
      ctx.reply("В вашем чате на эту дату нет свободных слотов")
    }
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    ctx.reply("There was an error fetching slots for the specified date.");
  }
}
