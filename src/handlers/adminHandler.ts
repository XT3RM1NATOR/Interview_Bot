import { addUserToDatabase } from "../service/service";

export const adminHandler = (ctx: any) => {
  ctx.reply('You chose Admin. Please enter the password:');
  
  // Listen for the user's response after choosing admin
  ctx.once('text', async (ctx: any) => {
    const enteredPassword = ctx.message.text;
    
    // Check if the entered password is correct
    const correctPassword = '123'; // Replace this with your actual password
    
    if (enteredPassword === correctPassword) {
      ctx.reply('Password correct. You are now an admin!');
      // Add the user to the database as an admin
      const user = await addUserToDatabase(ctx.from?.username, 'admin');
      console.log(user)
      // Perform any other actions after successfully adding the user as an admin
    } else {
      ctx.reply('Incorrect password. Access denied.');
    }
  });
};
