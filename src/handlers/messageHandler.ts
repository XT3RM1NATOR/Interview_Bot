import SessionRepository from "../repository/SessionRepository";
import { updateSessionStage } from "../service/sessionService";

export const announcementHandler = async (ctx: any) => {
  const session = await SessionRepository.findOne({ where: { id: ctx.session.id } })
  if(session?.role == "admin") updateSessionStage(ctx.session.id, 6);
  else ctx.reply("вы не авторизованы для этой команды");
}