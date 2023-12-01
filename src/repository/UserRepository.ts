import AppDataSource from "../config/mysql-config";
import { User } from "../entity/User";

const UserRepository = AppDataSource.getRepository(User);

export default UserRepository;
