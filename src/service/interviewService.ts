import { Context } from "telegraf";
import { InterviewerSlot } from "../entity/InterviewerSlot";
import { Session } from "../entity/Session";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { DaysMap } from "../resource/customTypes/type";
import { checkUser } from "./registrationService";

export const getTemplateForCurrentWeek = () => {
  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 for Sunday, 1 for Monday, and so on
  const remainingDays = daysOfWeek.slice(currentDayIndex); // Get all days from today till Sunday

  const template = remainingDays.map((day) => {
    return `${day}: XX:XX-XX:XX`;
  }).join('\n');

  return template;
};

export const convertToMySQLDateFormat = async (ctx: any, daysMap: DaysMap, dayOfWeek: keyof DaysMap, time: string) => {
  const today = new Date();
  const currentDay = today.getDay();
  const dayDifference = (daysMap[dayOfWeek] - currentDay + 7) % 7;
  const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dayDifference);
  console.log(session);
  const [hours, minutes] = time.split(':').map(Number);
  // Apply the UTC time with the additional offset
  if(session!.timezone_hour !== undefined && session!.timezone_minute !== undefined){
      const targetUTCTime = Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      hours - session!.timezone_hour, // Apply the additional offset for hours
      minutes - session!.timezone_minute // Apply the additional offset for minutes
    );
    // Create a new date object from the UTC time with the offset
    const targetDateWithOffset = new Date(targetUTCTime);
    const mysqlDateFormat = targetDateWithOffset.toISOString().slice(0, 19).replace('T', ' ');
    return mysqlDateFormat;
  }
};

export const saveTimeIntervals = async (ctx: any, startDateTimeStr: string, endDateTimeStr: string) => {
  try{
    console.log("i am trying to save it");
    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds
    const session = await SessionRepository.findOne({where: { id: ctx.session.id }});
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    let currentTime = startDateTime;

    const slotsToSave: InterviewerSlot[] = [];

    while (currentTime < endDateTime) {
      const nextTime = new Date(currentTime.getTime() + interval);

      if (nextTime > endDateTime) {
        nextTime.setTime(endDateTime.getTime());
      }
      const interviewer = await checkUser(ctx);
      const slot = new InterviewerSlot();
      if(session){
        slot.start_time = currentTime;
        slot.end_time = nextTime;
        slot.interviewer_username = ctx.message.from.username;
        slot.chat_id = session.tg_chat_id;
      }
      if(interviewer) slot.interviewer_id = interviewer.id;
      // Add this slot to the array
      slotsToSave.push(slot);

      currentTime = nextTime;
    }
    await InterviewerSlotRepository.save(slotsToSave);
  }catch(err){
    console.log(err);
  }
}

export const handleTimeSlotInput = async (ctx: any) => {

  const input = ctx.message.text;
  const dayTimePairs = input.split(/\n/);

  const daysMap: DaysMap = {
    'Понедельник': 1,
    'Вторник': 2,
    'Среда': 3,
    'Четверг': 4,
    'Пятница': 5,
    'Суббота': 6,
    'Воскресенье': 7,
  };

  dayTimePairs.forEach(async (dayTimePair: string) => {
    const [dayOfWeek, startTime, endTime] = dayTimePair.split(/:\s|-/);
    if (dayOfWeek in daysMap) { // Check if the dayOfWeek exists in DaysMap
      const startTimeMySQL = await convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, startTime);
      const endTimeMySQL = await convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, endTime);
      console.log("i am inside" + startTimeMySQL && endTimeMySQL);
      if(startTimeMySQL && endTimeMySQL) await saveTimeIntervals(ctx, startTimeMySQL, endTimeMySQL);
    } else {
      ctx.reply(`Invalid day: ${dayOfWeek}`);
    }
  });
  const options = [
    ['Сделать план на неделю', 'Проверить занятые слоты']
  ];

  ctx.reply('Что теперь?', {
    reply_markup: {
      keyboard: options,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
};

export const generateSlots = async (ctx: Context, slots: InterviewerSlot[], session: Session) => {
  for (const slot of slots) {
    const interviewer = await UserRepository.findOne({where: { id: slot.interviewer_id }});
    const user = await UserRepository.findOne({where: { chat_id: session!.chat_id }});

    const displayStartTime = new Date(slot.start_time);
    const displayEndTime = new Date(slot.end_time);

    if(session!.timezone_hour !== undefined && session!.timezone_minute !== undefined){
      displayStartTime.setHours(displayStartTime.getHours() + session!.timezone_hour, displayStartTime.getMinutes() + session!.timezone_minute);
      displayEndTime.setHours(displayEndTime.getHours() + session!.timezone_hour, displayEndTime.getMinutes() + session!.timezone_minute);
    }

    const startTime = displayStartTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const endTime = displayEndTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const message = `ID: ${slot.id}\nДата: ${slot.start_time.toISOString().slice(0, 10)}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
    
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅', callback_data: `select_slot_${slot.id}_${user?.id}` }]
        ]
      }
    });
  }
}





