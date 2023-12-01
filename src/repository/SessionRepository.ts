import AppDataSource from "../data-sourse";
import { Session } from "../entity/Session";

const SessionRepository = AppDataSource.getRepository(Session);

export default SessionRepository;