import dotenv from 'dotenv';
import { Context } from "telegraf";
import { LessThan } from 'typeorm';
import { InterviewerSlot } from "../entity/InterviewerSlot";
import { Session } from "../entity/Session";
import { User } from "../entity/User";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { DaysMap } from "../resource/customTypes/DaysMap";
import { checkUser } from "./registrationService";

dotenv.config();

export const getTemplateForCurrentWeek = () => {
  const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 for Sunday, 1 for Monday, and so on
  const daysInWeek = 7;

  const remainingDays = daysOfWeek.slice(currentDayIndex).concat(daysOfWeek.slice(0, currentDayIndex));
  const daysLeftInWeek = daysInWeek - (currentDayIndex === 0 ? 0 : currentDayIndex - 1);

  const template = remainingDays.slice(0, daysLeftInWeek).map((day) => {
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
  try {
    const interval = 90 * 60 * 1000; // 1.5 hours in milliseconds
    const session = await SessionRepository.findOne({ where: { id: ctx.session.id } });
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    let currentTime = startDateTime;

    const slotsToSave: InterviewerSlot[] = [];

    while (currentTime < endDateTime) {
      const nextTime = new Date(currentTime.getTime() + interval);

      // Check if the remaining time is less than 1.5 hours
      if (endDateTime.getTime() - currentTime.getTime() < interval) {
        // Check if the remaining time is more than 1 hour but less than 1.5 hours
        if (endDateTime.getTime() - currentTime.getTime() >= 60 * 60 * 1000) {
          // Include the last interval (between 1 and 1.5 hours)
          const interviewer = await checkUser(ctx);
          const slot = new InterviewerSlot();
          const check_slot = await InterviewerSlotRepository.findOne({
            where: {
              start_time: currentTime,
              interviewer_id: interviewer!.id,
            },
          });

          if (session && !check_slot) {
            slot.start_time = currentTime;
            slot.end_time = endDateTime;
            slot.interviewer_username = ctx.message.from.username;
            slot.chat_id = session.tg_chat_id;
            slot.interviewer_id = interviewer!.id;

            slotsToSave.push(slot);
          }
          break;
        } else {
          break; // Less than 1 hour remaining, exit loop
        }
      }

      const interviewer = await checkUser(ctx);
      const slot = new InterviewerSlot();
      const check_slot = await InterviewerSlotRepository.findOne({
        where: {
          start_time: currentTime,
          interviewer_id: interviewer!.id,
        },
      });

      if (session && !check_slot) {
        slot.start_time = currentTime;
        slot.end_time = nextTime > endDateTime ? endDateTime : nextTime;
        slot.interviewer_username = ctx.message.from.username;
        slot.chat_id = session.tg_chat_id;
        slot.interviewer_id = interviewer!.id;

        slotsToSave.push(slot);
      }

      currentTime = nextTime;
    }

    await InterviewerSlotRepository.save(slotsToSave);
  } catch (err) {
    console.log(err);
  }
};


//convert day input fromt he bot into valid dates
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
      if(startTimeMySQL && endTimeMySQL) await saveTimeIntervals(ctx, startTimeMySQL, endTimeMySQL);
    } else {
      ctx.reply(`Invalid day: ${dayOfWeek}`);
    }
  });
  const session = await SessionRepository.findOne( { where: { id: ctx.session.id } } )

  if(session?.role === "admin"){
    const options = [
      ['Сделать план на неделю', 'Посмотреть мои слоты', 'Cделать объявление'],
      ['Все слоты на неделю']
    ];
  
    ctx.reply('Что теперь?', {
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
  
    ctx.reply('Что теперь?', {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }
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
    const startTime = displayStartTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit'});
    const endTime = displayEndTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit'});

    const start_date = new Date(displayStartTime.setHours(displayStartTime.getHours() + parseInt(process.env.SERVER_GMT_HOUR!), displayEndTime.getMinutes() + parseInt(process.env.SERVER_GMT_MINUTE!))).toISOString().split('T')[0];

    let message = `ID: ${slot.id}\nДата: ${start_date}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
    
    if(slot.interviewee_id){
      message += "\n\nСТАТУС: ❌ЗАНЯТ❌";
      ctx.reply(message);
    }else{
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅', callback_data: `select_slot_${slot.id}_${user!.id}` }]
          ]
        }
      });
    }
  }
}
//
export const generateSlotsAdmin = async (ctx: Context, slots: InterviewerSlot[], session: Session) => {
  for (const slot of slots) {
    const interviewer = await UserRepository.findOne({where: { id: slot.interviewer_id }});

    const displayStartTime = new Date(slot.start_time);
    const displayEndTime = new Date(slot.end_time);

    if(session!.timezone_hour !== undefined && session!.timezone_minute !== undefined){
      displayStartTime.setHours(displayStartTime.getHours() + session!.timezone_hour, displayStartTime.getMinutes() + session!.timezone_minute);
      displayEndTime.setHours(displayEndTime.getHours() + session!.timezone_hour, displayEndTime.getMinutes() + session!.timezone_minute);
    }
    const startTime = displayStartTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit'});
    const endTime = displayEndTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit'});

    const start_date = new Date(displayStartTime.setHours(displayStartTime.getHours() + parseInt(process.env.SERVER_GMT_HOUR!), displayEndTime.getMinutes() + parseInt(process.env.SERVER_GMT_MINUTE!))).toISOString().split('T')[0];

    let message = `ID: ${slot.id}\nДата: ${start_date}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
    
    if(slot.interviewee_id){
      message += "\n\nСТАТУС: ❌ЗАНЯТ❌";
      ctx.reply(message);
    }else{
      await ctx.reply(message);
    }
  }
}
//

export const generateIntervieweeSlots = async (ctx: Context, slots: InterviewerSlot[], session: Session, user: User) => {
  for (const slot of slots) {
    const interviewer = await UserRepository.findOne({where: { id: slot.interviewer_id }});

    const displayStartTime = new Date(slot.start_time);
    const displayEndTime = new Date(slot.end_time);

    if(session!.timezone_hour !== undefined && session!.timezone_minute !== undefined){
      displayStartTime.setHours(displayStartTime.getHours() + session!.timezone_hour, displayStartTime.getMinutes() + session!.timezone_minute);
      displayEndTime.setHours(displayEndTime.getHours() + session!.timezone_hour, displayEndTime.getMinutes() + session!.timezone_minute);
    }

    const startTime = displayStartTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const endTime = displayEndTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const start_date = new Date(displayStartTime.setHours(displayStartTime.getHours() + parseInt(process.env.SERVER_GMT_HOUR!), displayEndTime.getMinutes() + parseInt(process.env.SERVER_GMT_MINUTE!))).toISOString().split('T')[0];;

    const message = `ID: ${slot.id}\nДата: ${start_date}\nНачало: ${startTime}\nКонец: ${endTime}\nБио интервьюера: ${interviewer?.description}\nИнтервьюер: @${slot.interviewer_username}`;
    
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚫', callback_data: `cancel_slot_${slot.id}_${user!.id}` }]
        ]
      }
    });
  }
}

export const generateInterviewerSlots = async (ctx: Context, slots: InterviewerSlot[], session: Session) => {
  for (const slot of slots) {
    let interviewee;
    if(slot.interviewee_id) interviewee = await UserRepository.findOne({where: { id: slot.interviewee_id }});

    const displayStartTime = new Date(slot.start_time);
    const displayEndTime = new Date(slot.end_time);

    if(session!.timezone_hour !== undefined && session!.timezone_minute !== undefined){
      displayStartTime.setHours(displayStartTime.getHours() + session!.timezone_hour, displayStartTime.getMinutes() + session!.timezone_minute);
      displayEndTime.setHours(displayEndTime.getHours() + session!.timezone_hour, displayEndTime.getMinutes() + session!.timezone_minute);
    }

    const startTime = displayStartTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const endTime = displayEndTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const start_date = new Date(displayStartTime.setHours(displayStartTime.getHours() + parseInt(process.env.SERVER_GMT_HOUR!), displayEndTime.getMinutes() + parseInt(process.env.SERVER_GMT_MINUTE!))).toISOString().split('T')[0];
    let message;
    if(interviewee){
      message = `ID: ${slot.id}\nДата: ${start_date}\nНачало: ${startTime}\nКонец: ${endTime}\n\n----------------\n\nСТАТУС РЕГИСТРАЦИИ: ✅ \n\nБио собеседуемого: ${interviewee!.description}\nСобеседуемый: @${interviewee!.username}`;
    }else{
      message = `ID: ${slot.id}\nДата: ${start_date}\nНачало: ${startTime}\nКонец: ${endTime}\n\n----------------\n\nСТАТУС РЕГИСТРАЦИИ: 🚫`
    }
    
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚫', callback_data: `cancel_slot_${slot.id}` }]
        ]
      }
    });
  }
}

export const deleteExpiredSlots = async () => {
  try {
    const currentDate = new Date(); // Current date and time
    // Find and delete slots where the end time has passed
    const expiredSlots = await InterviewerSlotRepository.find({
      where: { end_time: LessThan(currentDate) }
    });

    if (expiredSlots.length > 0) {
      // Delete expired slots from the database
      await InterviewerSlotRepository.remove(expiredSlots);
    }
  } catch (error) {
    //
  }

  // Schedule the function to run again after a certain interva
  setTimeout(deleteExpiredSlots, 1000 * 60 * 60 * 6);
};





