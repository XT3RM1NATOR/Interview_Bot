import { Context, Telegraf } from 'telegraf';

// Create a new instance of Telegraf bot using your bot token
const bot = new Telegraf('6961764510:AAG9nxdNlrCTN1bIsjiC53PqXoy4-q5YPEc');

// Command to list available commands
bot.command('help', (ctx: Context) => {
  ctx.reply('Available commands: /start, /help');
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
