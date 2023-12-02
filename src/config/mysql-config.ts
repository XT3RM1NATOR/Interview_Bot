import { DataSource } from "typeorm";
import { ChatList } from "../entity/ChatList";
import { InterviewerSlot } from "../entity/InterviewerSlot";
import { Session } from "../entity/Session";
import { User } from "../entity/User";


const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "milkshake",
  database: "node_ru",
  entities: [User, ChatList, InterviewerSlot, Session]
})

AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
  })
  .catch((error) => console.log(error));

export default AppDataSource;