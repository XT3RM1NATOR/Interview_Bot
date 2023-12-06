import dotenv from 'dotenv';
import { DataSource } from "typeorm";
import { ChatList } from "../entity/ChatList";
import { InterviewerSlot } from "../entity/InterviewerSlot";
import { Session } from "../entity/Session";
import { User } from "../entity/User";

dotenv.config();


const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT!),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: "node_ru",
  entities: [User, ChatList, InterviewerSlot, Session]
})

AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
  })
  .catch((error) => console.log(error));

export default AppDataSource;
