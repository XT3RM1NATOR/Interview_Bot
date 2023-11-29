import { AppDataSource } from "../data-sourse"
import { ChatList } from "../entity/ChatList"

const ChatListRepository = AppDataSource.getRepository(ChatList)
