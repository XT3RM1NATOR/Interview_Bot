import { User } from "../entity/User";
import UserRepository from "../repository/UserRepository";

export const addUserToDatabase = async(username: string, role: string, chat_id: number, timezone?: string, description?: string, approved?: boolean) => {
  try {
    const newUser = new User();

    newUser.username = username;
    newUser.role = role;
    newUser.timezone = timezone || 'Not Specified';
    newUser.chat_id = chat_id;
    newUser.description = description;
    newUser.approved = approved;

    return await UserRepository.save(newUser);
  } catch (err) {

    console.error("Error adding user to database:", err);
  }
};

export const isValidGMTFormat = (text: string): boolean => {
  const gmtRegex = /^(-?(?:1[0-2]|[0-9])(?:\.30)?|-12)$/;

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

export const sendMessagesToAdmins = async (ctx: any, user: User) => {
  try{

    const admins = await getAdmins();
    const options = [
      [`✅${user.id}`, `🚫${user.id}`]
    ];

    const message = `👨🏻‍💻Interviewer Application:\nUsername: @${user.username}\nTimezone: GMT(${user.timezone})\nDescription: ${user.description}`;
    
    if(admins){
      for (const admin of admins) {

        const adminChatId = admin.chat_id;
  
        // Send the message to admins
        await ctx.telegram.sendMessage(adminChatId, message, {
          reply_markup: {
            keyboard: options,
            one_time_keyboard: true, 
            resize_keyboard: true
          }
        });
      }
      console.log('Messages sent to all admins.');
    }
  } catch(err){
    console.log(err);
  }
};

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

      ctx.session ??= { 
        role: "",
        adminStage: false,
        timezone: "",
        description: "",
        gmtStage: false,
        descriptionStage: false,
        interviewer:false,
        newDescriptionStage: false
       }; //привожу сессию в изначальный формат

      ctx.reply("Ваш аккаунт удален");
    } else {
      ctx.reply("У вас еще нет аккаунта");
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    ctx.reply("Произошла ошибка при удалении аккаунта");
  }
};
