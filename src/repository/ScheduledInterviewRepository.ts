import AppDataSource from "../config/mysql-config";
import { ScheduledInterview } from "../entity/ScheduledInterview";

const ScheduledInterviewRepository = AppDataSource.getRepository(ScheduledInterview);

export default ScheduledInterviewRepository;
