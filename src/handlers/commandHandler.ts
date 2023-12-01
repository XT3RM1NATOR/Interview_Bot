import { deleteAccount } from '../service/registrationService';
import { deleteSessionById, saveNewSession, updateSessionNewDescriptionStage } from '../service/sessionService';

export const startCommand = async (ctx: any) => {
  const session = await saveNewSession(ctx, ctx.chat.id);

  if (session) {
    ctx.session ??= { 
      id: session.id,
      role: "",
      adminStage: false,
      timezone: "",
      description: "",
      gmtStage: false,
      descriptionStage: false,
      interviewer: false,
      newDescriptionStage: false,
      chat_id: ctx.chat.id
    };
  }
  
  const options = [
    ['Admin', 'Interviewer', 'Interviewee']
  ];

  ctx.reply('Please select an option:', {
    reply_markup: {
      keyboard: options,
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
};

export const newDescriptionCommand = async (ctx: any) => {
  if (ctx.session) {
    ctx.session.newDescriptionStage = true;
    ctx.reply("Кидай новое описание");
    await updateSessionNewDescriptionStage(ctx.session.id, true);
  } else {
    ctx.reply("Для начала нажми /start");
  }
};

export const deleteAccountCommand = async (ctx: any) => {
  const chatId = ctx.message.chat.id;
  if (ctx.session?.id) await deleteSessionById(ctx.session.id);
  await deleteAccount(ctx, chatId);
};