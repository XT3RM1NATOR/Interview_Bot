import { AppDataSource } from "../data-sourse"
import { InterviewerSlot } from "../entity/InterviewerSlot"

const photoRepository = AppDataSource.getRepository(InterviewerSlot)
