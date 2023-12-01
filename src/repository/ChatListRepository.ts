import AppDataSource from "../config/mysql-config";
import { ChatList } from "../entity/ChatList";

const ChatListRepository = AppDataSource.getRepository(ChatList);

export default ChatListRepository;
