import { User } from "../entity/User";
import UserRepository from "../repository/UserRepository";

export const addUserToDatabase = async(username: string, role: string, chat_id: number, timezone?: string, description?:string, approved?:boolean) => {
  const newUser = new User();
  newUser.username = username;
  newUser.role = role;
  newUser.timezone = timezone || 'Not Specified';
  newUser.chat_id = chat_id;
  newUser.description = description;
  newUser.approved = approved;
  console.log(newUser);
  return await UserRepository.save(newUser);
}

export const isValidGMTFormat = (text: string): boolean => {
  const gmtRegex = /^(-?(?:1[0-2]|[0-9])(?:\.30)?|-12)$/;

  return gmtRegex.test(text.trim());
};

export const getAdmins = async() => {
  const adminUsers = await UserRepository.find({ where: { role: 'admin' } });
  return adminUsers;
}

export const sendMessagesToAdmins = async (ctx: any, user: User) => {
  const admins = await getAdmins();

  const options = [
    [`✅${user.id}`, `🚫${user.id}`]
  ];

  const message = `👨🏻‍💻Interviewer Application:\nUsername: @${user.username}\nTimezone: GMT(${user.timezone})\nDescription: ${user.description}`;

  for (const admin of admins) {
    const adminChatId = admin.chat_id;

    // Send the message to admins
    await ctx.telegram.sendMessage(adminChatId,message , {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true, // Hide the keyboard after a choice is made
        resize_keyboard: true // Allow the keyboard to be resized by the user
      }
    });
  }

  console.log('Messages and keyboard sent to all admins.');
};