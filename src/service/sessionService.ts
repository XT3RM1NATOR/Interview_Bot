import { default as sessionRepository } from "../repository/SessionRepository";
import { convertStringToNumbers } from "./registrationService";

export const saveNewSession = async (ctx: any, chat_id: number, tg_chat_id: number) => {

  const existingSession = await sessionRepository.findOne({ where: { chat_id: chat_id } });

  if (existingSession) {
    existingSession.role = "";
    existingSession.stageId = 0;
    existingSession.timezone_hour = 0;
    existingSession.timezone_minute = 0;
    existingSession.description = "";
    existingSession.interviewer = false;
    existingSession.tg_chat_id = tg_chat_id;

    return await sessionRepository.save(existingSession);
  } else {
    const newSession = sessionRepository.create({
      role: "",
      stageId: 0,
      timezone_hour: 0,
      timezone_minute: 0,
      description: "",
      interviewer: false,
      chat_id: chat_id,
      tg_chat_id: tg_chat_id
    });

    return await sessionRepository.save(newSession);
  }
};

export const updateSessionRole = async (id: number, newRole: string) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    existingSession!.role = newRole;
    await sessionRepository.save(existingSession!);
  } catch (error) {
    console.error("Error updating role:", error);
  }
};

export const updateSessionStage = async (id: number, stageId: number) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    existingSession!.stageId = stageId;
    await sessionRepository.save(existingSession!);

  } catch (error) {
    console.error("Error updating stage ID:", error);
  }
};

export const updateSessionTimezone = async (id: number, newTimezone: string) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });
    const timezone = convertStringToNumbers(newTimezone);

    if (existingSession && timezone) {
      existingSession.timezone_hour = timezone[0];
      existingSession.timezone_minute = timezone[1] || 0;
      await sessionRepository.save(existingSession);
    }
  } catch (error) {
    console.error("Error updating timezone:", error);
  }
};

export const updateSessionDescription = async (id: number, newDescription: string) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    existingSession!.description = newDescription;
    await sessionRepository.save(existingSession!);

  } catch (error) {
    console.error("Error updating description:", error);
  }
};

export const updateSessionInterviewer = async (id: number, isInterviewer: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    existingSession!.interviewer = isInterviewer;
    await sessionRepository.save(existingSession!);

  } catch (error) {
    console.error("Error updating interviewer:", error);
  }
};

export const deleteSessionById = async (id: number) => {
  try {
    const sessionToDelete = await sessionRepository.findOne({ where: { id: id } });

    await sessionRepository.remove(sessionToDelete!);
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};







