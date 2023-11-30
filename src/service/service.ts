import { User } from "../entity/User";
import UserRepository from "../repository/UserRepository";

export const addUserToDatabase = async(username: string, role: string, timezone?: string) => {
  const newUser = new User();
  newUser.username = username || '';
  newUser.role = role;
  newUser.timezone = timezone || 'Not Specified';
  
  return await UserRepository.save(newUser);
}