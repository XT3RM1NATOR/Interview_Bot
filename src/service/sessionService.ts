import sessionRepository from "../repository/SessionRepository";

// Update or clear sessions for all fetched users
export const updateSessionsForUser = async (ctx: any) => {
  try {
    const session = sessionRepository.findOne( { where: { chat_id: ctx.chat.id } } );
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
    existingSession.adminStage = false;
    existingSession.timezone = "";
    existingSession.description = "";
    existingSession.gmtStage = false;
    existingSession.descriptionStage = false;
    existingSession.interviewer = false;
    existingSession.newDescriptionStage = false;

    console.log("Existing session updated successfully!");

    return await sessionRepository.save(existingSession);
  } else {
    // Create a new session if the chat_id doesn't exist
    const newSession = sessionRepository.create({
      role: "",
      adminStage: false,
      timezone: "",
      description: "",
      gmtStage: false,
      descriptionStage: false,
      interviewer: false,
      newDescriptionStage: false,
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

// Function to update admin stage
export const updateSessionAdminStage = async (id: number, isAdmin: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.adminStage = isAdmin;
      await sessionRepository.save(existingSession);
      console.log("Admin stage updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating admin stage:", error);
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

export const updateSessionGmtStage = async (id: number, newGmtStage: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.gmtStage = newGmtStage;
      await sessionRepository.save(existingSession);
      console.log("Gmt Stage updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating GMT stage:", error);
  }
};

export const updateSessionDescriptionStage = async (id: number, newDescriptionStage: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.descriptionStage = newDescriptionStage;
      await sessionRepository.save(existingSession);
      console.log("Description Stage updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating description stage:", error);
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

export const updateSessionNewDescriptionStage = async (id: number, isNewDescriptionStage: boolean) => {
  try {
    const existingSession = await sessionRepository.findOne({ where: { id: id } });

    if (existingSession) {
      existingSession.newDescriptionStage = isNewDescriptionStage;
      await sessionRepository.save(existingSession);
      console.log("New Description Stage updated successfully!");
    } else {
      console.log("Session not found.");
    }
  } catch (error) {
    console.error("Error updating new description stage:", error);
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





