import { User } from "../entity/User";
import SessionRepository from "../repository/SessionRepository";
import UserRepository from "../repository/UserRepository";
import { updateSessionRole } from "./sessionService";

export const addUserToDatabase = async(username: string, role: string, chat_id: number, tg_chat_id: number,  timezone_hour?: number, timezone_minute?: number, description?: string, approved?: boolean) => {
  try {
    const newUser = new User();

    newUser.username = username;
    newUser.role = role;
    newUser.timezone_hour = timezone_hour;
    newUser.timezone_minute = timezone_minute;
    newUser.chat_id = chat_id;
    newUser.description = description;
    newUser.approved = approved;
    newUser.tg_chat_id = tg_chat_id;

    return await UserRepository.save(newUser);
  } catch (err) {

    console.error("Error adding user to database:", err);
  }
};

export const isValidGMTFormat = (text: string): boolean => {
  const gmtRegex = /^(-?(?:1[0-2]|\d)(?:\:30)?|-12)$/;
  return gmtRegex.test(text.trim());
};

export const getAdmins = async() => {
  try{
    const adminUsers = await UserRepository.find({ where: { role: 'admin' } });
    return adminUsers;
  } catch(err) {
    console.log(err);
  }
}

export const Confirmation = async (ctx: any, chat_id: number) => {
  try{
      
    const options = [
      [`Сделать план на неделю`, `Проверить занятые слоты`]
    ];
      // Send the message to admins
    await ctx.telegram.sendMessage(chat_id, "Вы были одобрены! Что теперь?", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true, // Hide the keyboard after a choice is made
        resize_keyboard: true // Allow the keyboard to be resized by the user
      }
    });

    console.log('Confirmation sent to interviewer');
  } catch(err){
    console.log(err);
  }
};

export const Rejection = async (ctx: any, chat_id: number) => {
  try{

    const options = [
      [`Зарег. как собеседуемый`]
    ];
      // Send the message to admins
    await ctx.telegram.sendMessage(chat_id, "Вы не были одобрены... Что теперь?", {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true, 
        resize_keyboard: true
      }
    });

    console.log('Confirmation sent to interviewer');
  }catch(err){
    console.log(err);
  }
};

export const changeDescription = async (ctx: any, chatId: number, newDescription: string) => {
  try {
    const user = await UserRepository.findOne({ where: { chat_id: chatId } });
    if (user) {
      user.description = newDescription;

      await UserRepository.save(user); 
      ctx.reply("Описание успешно обновлено");

    } else {
      ctx.reply("Ты еще не зарегистрировался");
    }

  } catch (err) {
    console.log(err);
  }
};

export const deleteAccount = async (ctx: any, chatId: number) => {
  try {
    const userToRemove = await UserRepository.find({ where: { chat_id: chatId } });

    if (userToRemove.length > 0) {
      await UserRepository.remove(userToRemove);
      ctx.session = null;
      ctx.reply("Ваш аккаунт удален нажмите /start что бы начать заново");
    } else {
      ctx.reply("У вас еще нет аккаунта");
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    ctx.reply("Произошла ошибка при удалении аккаунта");
  }
};

export const checkUser = async(ctx: any) => {
  const user = await UserRepository.findOne( { where: { chat_id: ctx.chat.id } } );
  return user;
}

export const callbackQueryHandler = async (ctx: any) => {
  try {
    const data = ctx.callbackQuery.data;
    const userId = parseInt(data.split('_')[1]); // Extract the user ID from callback_data
    console.log(userId);
    if (data.startsWith('accept')) {
      await acceptCallback(ctx, userId);
    } else if (data.startsWith('reject')) {
      await rejectCallback(ctx, userId);
    }
  } catch (err) {
    console.log(err);
  }
};

// Accept callback function
export const acceptCallback = async (ctx: any, userId: number) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });
    const session = await SessionRepository.findOne({where: {chat_id:user?.chat_id}})
    if (user && session) {
      updateSessionRole(session.id, "interviewer");
      user.approved = true;
      await UserRepository.save(user);
      Confirmation(ctx, user.chat_id);
      ctx.reply("Юзер успешно одобрен!");
    }
  } catch (error) {
    console.log(error);
    ctx.reply("Произошла ошибка при одобрении юзера.");
  }
};

// Reject callback function
export const rejectCallback = async (ctx: any, userId: number) => {
  try {
    const user = await UserRepository.findOne({ where: { id: userId } });

    if (user) {
      Rejection(ctx, user.chat_id);
      ctx.reply("Юзер успешно отказан!");
    }
  } catch (error) {
    console.log(error);
    ctx.reply("Произошла ошибка при отказе юзера.");
  }
};

export const convertStringToNumbers = (input: string): number[] | [number, number] | undefined => {
  const numRegex = /^-?\d+$/;
  const timeRegex = /^(-?\d+):(-?\d+)$/;

  if (numRegex.test(input)) {
    const parsedNum = parseInt(input, 10);
    return [parsedNum];
  } else if (timeRegex.test(input)) {
    const [, hours, minutes] = input.match(timeRegex)!;
    const parsedHours = parseInt(hours, 10);
    const parsedMinutes = parseInt(minutes, 10);

    // Ensure both hours and minutes are negative if input is in negative time format
    const negativeMinutes = input.startsWith('-') ? -parsedMinutes : parsedMinutes;
    return [parsedHours, negativeMinutes];
  } else {
    return undefined; // Returning undefined for invalid input
  }
}
