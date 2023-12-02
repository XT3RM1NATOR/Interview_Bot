import { DaysMap } from "../type/type";

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

export const convertToMySQLDateFormat = (daysMap: DaysMap, dayOfWeek: keyof DaysMap, time: string, offsetHours: number = 0, offsetMinutes: number = 0) => {
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
    hours - offsetHours, // Apply the additional offset for hours
    minutes - offsetMinutes // Apply the additional offset for minutes
  );

  // Create a new date object from the UTC time with the offset
  const targetDateWithOffset = new Date(targetUTCTime);

  const mysqlDateFormat = targetDateWithOffset.toISOString().slice(0, 19).replace('T', ' ');

  return mysqlDateFormat;
};
