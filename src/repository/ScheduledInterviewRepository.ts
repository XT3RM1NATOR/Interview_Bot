import { AppDataSource } from "../data-sourse"
import { ScheduledInterview } from "../entity/ScheduledInterview"

const ScheduledInterviewRepository = AppDataSource.getRepository(ScheduledInterview)
