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
  } catch (err) {
    console.log(err);
  }
};