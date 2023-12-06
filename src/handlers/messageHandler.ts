import SessionRepository from "../repository/SessionRepository";
import { checkServer } from "../service/messageService";
import { updateSessionStage } from "../service/sessionService";

export const announcementHandler = async (ctx: any) => {
  const check = await checkServer(ctx);
  if(check){
    try{
      const session = await SessionRepository.findOne({ where: { id: ctx.session.id } })
      if(session?.role == "admin") {
        ctx.reply("Пришлите оповещение");
        await updateSessionStage(ctx.session.id, 6);
      }else {
        ctx.reply("вы не авторизованы для этой команды");
      }
    }catch(err){
      console.log(err);
    }
  }
}