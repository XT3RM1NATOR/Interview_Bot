import { AppDataSource } from "../data-sourse"
import { User } from "../entity/User"

const UserRepository = AppDataSource.getRepository(User)

export default UserRepository
