import sessionRepository from "../repository/SessionRepository";

// Update or clear sessions for all fetched users
export const updateSessionsForUser = async (ctx: any) => {
  try {
    const session = await sessionRepository.findOne( { where: { chat_id: ctx.chat.id } } );
    ctx.session = session;
  } catch (err) {
    console.log(err);
  }
};

export const saveNewSession = async (ctx: any, chat_id: number) => {

  const existingSession = await sessionRepository.findOne({ where: { chat_id: chat_id } });

  if (existingSession) {
    // Update the existing session with new values
    existingSession.role = "";
    existingSession.stageId = 0;
    existingSession.timezone = "";
    existingSession.description = "";
    existingSession.interviewer = false;

    console.log("Existing session updated successfully!");

    return await sessionRepository.save(existingSession);
  } else {
    // Create a new session if the chat_id doesn't exist
    const newSession = sessionRepository.create({
      role: "",
      stageId: 0,
      timezone: "",
      description: "",
      interviewer: false,
      chat_id: chat_id
    });
    console.log("New session saved successfully!");

    return await sessionRepository.save(newSession);
  }
};

export const updateSessionRole = async (id: number, newRole: string) => {
  try {
    // Fetch session from the repository based on chat_id
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      // Update the role
      existingSession.role = newRole;

      // Save the changes to the database
      await sessionRepository.save(existingSession);

      console.log("Role updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating role:", error);
  }
};

export const updateSessionStage = async (id: number, stageId: number) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.stageId = stageId;
      await sessionRepository.save(existingSession);
      console.log("Stage ID updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating stage ID:", error);
  }
};

export const updateSessionTimezone = async (id: number, newTimezone: string) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.timezone = newTimezone;
      await sessionRepository.save(existingSession);
      console.log("Timezone updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating timezone:", error);
  }
};

// Function to update session description
export const updateSessionDescription = async (id: number, newDescription: string) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.description = newDescription;
      await sessionRepository.save(existingSession);
      console.log("Description updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating description:", error);
  }
};

export const updateSessionInterviewer = async (id: number, isInterviewer: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.interviewer = isInterviewer;
      await sessionRepository.save(existingSession);
      console.log("Interviewer updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating interviewer:", error);
  }
};

export const deleteSessionById = async (id: number) => {
  try {
    const sessionToDelete = await sessionRepository.findOne({ where: { id: id } });

    if (sessionToDelete) {
      await sessionRepository.remove(sessionToDelete);
      console.log("Session deleted successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};





