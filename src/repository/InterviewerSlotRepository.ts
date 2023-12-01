import AppDataSource from "../config/mysql-config";
import { InterviewerSlot } from "../entity/InterviewerSlot";

const InterviewerSlotRepository = AppDataSource.getRepository(InterviewerSlot);

export default InterviewerSlotRepository;
