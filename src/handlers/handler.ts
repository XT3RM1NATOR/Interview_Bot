import { updateSessionAdminStage, updateSessionGmtStage, updateSessionInterviewer } from "../service/sessionService";

export const adminHandler = async (ctx: any) => {
  ctx.session.adminStage = true;
  await updateSessionAdminStage(ctx.session.id, true);
  ctx.reply('You chose Admin. Please enter the password:');
}

export const interviewerHandler = async(ctx: any) => {
  ctx.session.interviewer = true;
  ctx.session.gmtStage = true;
  await updateSessionGmtStage(ctx.session.id, true);
  await updateSessionInterviewer(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

export const intervieweeHandler = async (ctx: any) => {
  ctx.session.gmtStage = true;
  await updateSessionGmtStage(ctx.session.id, true);
  ctx.reply('write your gmt time zone in the format "5" or "-4.30');
};

