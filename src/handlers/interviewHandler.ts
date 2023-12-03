
import { getTemplateForCurrentWeek, handleTimeSlotInput } from "../service/interviewService";
import { checkServer } from "../service/messageService";
import { updateSessionStage } from "../service/sessionService";

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

export const timeSlotHandler = async (ctx: any) => {
  const check = await checkServer(ctx);

  if (ctx.session.stageId === 5 && check) {
    ctx.session.stageId = 0;
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
