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
