
import { convertToMySQLDateFormat, getTemplateForCurrentWeek, saveTimeIntervals } from "../service/interviewService";
import { checkServer } from "../service/messageService";
import { updateSessionStage } from "../service/sessionService";
import { DaysMap } from "../type/type";

export const planHandler = async (ctx:any) => {
  const check = await checkServer(ctx);
  if(check){
    const instructions = "Кидай в определенном формате ниже шаблон на эту неделю: (Время только ровное по 30 минут промежуткам, например 15:00 или 14:30)";
    ctx.reply(instructions);

    ctx.session.stageId = 5;
    await updateSessionStage(ctx.session.id, 5);

    const templateForWeek = getTemplateForCurrentWeek();
    ctx.reply(`${templateForWeek}`);
  }
}

export const handleTimeSlotInput = async (ctx: any) => {
  const check = await checkServer(ctx);
  
  if(ctx.session.stageId === 5 && check){
    ctx.session.stageId = 0;
    await updateSessionStage(ctx.session.id, 0);

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
        console.log(`Invalid day: ${dayOfWeek}`);
      }
    });
  }else{
    ctx.reply("Вы не авторизованы для команды или не прошли правильно")
  }
  
};
