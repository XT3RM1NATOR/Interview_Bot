import { getTemplateForCurrentWeek } from "../service/interviewService";

export const planHandler = (ctx:any) => {
  const instructions = "Кидай в определенном формате ниже шаблон на эту неделю: (Время только ровное по 30 минут промежуткам, например 15:00 или 14:30)";
  ctx.reply(instructions);

  const templateForWeek = getTemplateForCurrentWeek();
  ctx.reply(`${templateForWeek}`);
}