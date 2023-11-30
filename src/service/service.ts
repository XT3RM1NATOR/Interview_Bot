import { User } from "../entity/User";
import UserRepository from "../repository/UserRepository";

export const addUserToDatabase = async(username: string, role: string, chat_id: number, timezone?: string, description?:string) => {
  const newUser = new User();
  newUser.username = username;
  newUser.role = role;
  newUser.timezone = timezone || 'Not Specified';
  newUser.chat_id = chat_id;
  newUser.description = description;
  console.log(newUser);
  return await UserRepository.save(newUser);
}