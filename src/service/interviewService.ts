import { format } from 'date-fns';
import { InterviewerSlot } from "../entity/InterviewerSlot";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import { DaysMap } from "../type/type";
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

export const convertToMySQLDateFormat = (ctx: any, daysMap: DaysMap, dayOfWeek: keyof DaysMap, time: string) => {
  const today = new Date();
  const currentDay = today.getDay();
  const dayDifference = (daysMap[dayOfWeek] - currentDay + 7) % 7;

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dayDifference);

  const [hours, minutes] = time.split(':').map(Number);
  // Apply the UTC time with the additional offset
  const targetUTCTime = Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    hours - ctx.session.timezone_hour, // Apply the additional offset for hours
    minutes - ctx.session.timezone_minute // Apply the additional offset for minutes
  );

  // Create a new date object from the UTC time with the offset
  const targetDateWithOffset = new Date(targetUTCTime);
  const mysqlDateFormat = targetDateWithOffset.toISOString().slice(0, 19).replace('T', ' ');

  return mysqlDateFormat;
};

export const saveTimeIntervals = async (ctx: any, startDateTimeStr: string, endDateTimeStr: string) => {
  try{
    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    let currentTime = new Date(startDateTime);

    const slotsToSave: InterviewerSlot[] = [];

    while (currentTime < endDateTime) {
      const nextTime = new Date(currentTime.getTime() + interval);

      if (nextTime > endDateTime) {
        nextTime.setTime(endDateTime.getTime());
      }
      const interviewer = await checkUser(ctx);
      const slot = new InterviewerSlot();
      slot.start_time = format(currentTime, 'yyyy-MM-dd HH:mm:ss');
      slot.end_time = format(nextTime, 'yyyy-MM-dd HH:mm:ss');
      if(interviewer) slot.interviewer_id = interviewer.id;
      // Add this slot to the array
      slotsToSave.push(slot);

      currentTime = nextTime;
    }
    console.log(ctx.session + "\n\n\n");
    // Save the slots to the database
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
      const startTimeMySQL = convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, startTime);
      const endTimeMySQL = convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, endTime);
      await saveTimeIntervals(ctx, startTimeMySQL, endTimeMySQL);
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



