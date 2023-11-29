import { AppDataSource } from "../data-sourse"
import { InterviewerSlot } from "../entity/InterviewerSlot"

const InterviewerSlotRepository = AppDataSource.getRepository(InterviewerSlot)

export default InterviewerSlotRepository
