import AppDataSource from "../config/mysql-config";
import { Session } from "../entity/Session";

const SessionRepository = AppDataSource.getRepository(Session);

export default SessionRepository;