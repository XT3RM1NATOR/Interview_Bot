export const intervieweeHandler = (ctx: any) => {
  ctx.session.gmtStage = true;
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};