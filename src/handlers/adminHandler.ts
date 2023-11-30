export const adminHandler = async (ctx: any) => {
  ctx.session.adminStage = true
  ctx.reply('You chose Admin. Please enter the password:');
}
