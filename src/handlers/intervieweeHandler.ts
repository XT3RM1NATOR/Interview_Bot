import { updateSessionGmtStage } from "../service/sessionService";

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.gmtStage = true;
  await updateSessionGmtStage(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};