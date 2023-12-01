import { updateSessionAdminStage } from "../service/sessionService";


export const adminHandler = async (ctx: any) => {
  ctx.session.adminStage = true;
  await updateSessionAdminStage(ctx.session.id, true);
  ctx.reply('You chose Admin. Please enter the password:');
}

