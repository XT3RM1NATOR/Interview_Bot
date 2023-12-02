import { InterviewerSlot } from "../entity/InterviewerSlot";
import InterviewerSlotRepository from "../repository/InterviewerSlotRepository";
import { DaysMap } from "../type/type";
import { checkUser } from "./registrationService";

export const getTemplateForCurrentWeek = () => {
  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 for Sunday, 1 for Monday, and so on
  const remainingDays = daysOfWeek.slice(currentDayIndex); // Remaining days in the week
  
  const template = remainingDays.map((day, index) => {
    const dayOfWeek = daysOfWeek[currentDayIndex + index];
    return `${dayOfWeek}: XX:XX-XX:XX`; // Replace XX:XX-XX:XX with the time format
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
  console.log("the time\n" + ctx.session.timezone_hour + "\n" + ctx.session.timezone_minute + "\n" + ctx.session);
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
  console.log("this is the target " + targetDateWithOffset + "\n\n\n");
  const mysqlDateFormat = targetDateWithOffset.toISOString().slice(0, 19).replace('T', ' ');

  return mysqlDateFormat;
};

const saveTimeIntervals = async (ctx: any, startDateTimeStr: string, endDateTimeStr: string) => {
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
    slot.start_time = currentTime.toISOString(); // Convert Date to string
    slot.end_time = nextTime.toISOString(); // Convert Date to string
    if(interviewer) slot.interviewer_id = interviewer.id;
    // Add this slot to the array
    slotsToSave.push(slot);

    currentTime = nextTime;
  }

  // Save the slots to the database
  await InterviewerSlotRepository.save(slotsToSave);
}




