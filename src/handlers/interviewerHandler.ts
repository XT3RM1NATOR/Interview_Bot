export const interviewerHandler = (ctx: any) => {
  ctx.session.interviewer = true
  ctx.reply('You chose Interviewer');
  // Perform interviewer-related actions
  // Add your interviewer logic here
};