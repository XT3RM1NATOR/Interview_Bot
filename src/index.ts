import dotenv from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { message } from "telegraf/filters";

dotenv.config();

// Create a new instance of Telegraf bot using your bot token
const bot = new Telegraf("6961764510:AAG9nxdNlrCTN1bIsjiC53PqXoy4-q5YPEc")

bot.command('start', (ctx) => {
  const options = [
    ['Admin', 'Interviewer', 'Interviewee'],
    ['Help']
  ];

  ctx.reply('Please select an option:', {
    reply_markup: {
      keyboard: options,
      one_time_keyboard: true, // Hide the keyboard after a choice is made
      resize_keyboard: true // Allow the keyboard to be resized by the user
    }
  });
});

// Handler for handling the selected option
bot.on(message("text"), (ctx) => {
  const selectedOption = ctx.message.text;

  // Handle selected options here
  switch (selectedOption) {
    case 'Admin':
      ctx.reply('You chose Admin');
      // Perform admin-related actions
      break;
    case 'Interviewer':
      ctx.reply('You chose Interviewer');
      // Perform interviewer-related actions
      break;
    case 'Interviewee':
      ctx.reply('You chose Interviewee');
      // Perform interviewee-related actions
      break;
    case 'Help':
      ctx.reply('You chose Help');
      // Perform help-related actions
      break;
    default:
      ctx.reply('Please use the provided keyboard to select an option.');
  }
});

// Error handling
bot.catch((err: any, ctx: Context) => {
  console.error(`Error for ${ctx.updateType}`, err);
});



// Start the bot
bot.launch().then(() => {
  console.log('Bot started');
}).catch((err) => {
  console.error('Error starting bot', err);
});
