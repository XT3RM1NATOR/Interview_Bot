
import { convertToMySQLDateFormat, getTemplateForCurrentWeek } from "../service/interviewService";
import { DaysMap } from "../type/type";

export const planHandler = (ctx:any) => {
  const instructions = "Кидай в определенном формате ниже шаблон на эту неделю: (Время только ровное по 30 минут промежуткам, например 15:00 или 14:30)";
  ctx.reply(instructions);

  const templateForWeek = getTemplateForCurrentWeek();
  ctx.reply(`${templateForWeek}`);
}

export const handleTimeSlotInput = (ctx: any) => {
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

  dayTimePairs.forEach((dayTimePair: string) => {
    const [dayOfWeek, startTime, endTime] = dayTimePair.split(/:\s|-/);
    if (dayOfWeek in daysMap) { // Check if the dayOfWeek exists in DaysMap
      const startTimeMySQL = convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, startTime);
      const endTimeMySQL = convertToMySQLDateFormat(ctx, daysMap, dayOfWeek as keyof DaysMap, endTime);
      //await saveTimeIntervals(ctx, Date(startTimeMySQL), endTimeMySQL);
    } else {
      console.log(`Invalid day: ${dayOfWeek}`);
    }
  });
};
