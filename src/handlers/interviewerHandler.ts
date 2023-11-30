export const interviewerHandler = (ctx: any) => {
  ctx.session.interviewer = true;
  ctx.session.gmtStage = true;
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};