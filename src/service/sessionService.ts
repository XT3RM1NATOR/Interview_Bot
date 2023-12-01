import sessionRepository from "../repository/SessionRepository";

// Update or clear sessions for all fetched users
export const updateSessionsForAllUsers = async (bot: any) => {
  try {
    const sessions = await sessionRepository.find();

    for (const session of sessions) {

      bot.sessionStore.sessions[session.chat_id] = session;
    }
    console.log(bot.sessionStore)
  } catch(err){
    console.log(err);
  }
};

export const saveNewSession = async (ctx: any, chat_id: number) => {
  try {

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

      await sessionRepository.save(existingSession);
      console.log("Existing session updated successfully!");
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

      await sessionRepository.save(newSession);
      console.log("New session saved successfully!");
    }
  } catch (err) {
    console.log(err);
  }
};