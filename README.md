# Interview Scheduler Bot for nodejs_ru Telegram Group

This project provides an automated interview scheduling bot for the [nodejs_ru Telegram group](https://t.me/nodejs_ru). The bot streamlines the process of scheduling practice interviews without relying on manual communication within the chat.

## Tech Stack 
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Features

- Automates interview scheduling within the Telegram group.
- Uses TypeScript with PostgreSQL for efficient and type-safe development.
- Simplifies interview scheduling by providing a bot interface.

## Getting Started

### Prerequisites

- [ngrok](https://ngrok.com/download) for tunneling the local server.
- [Node.js](https://nodejs.org/en/download/) (with npm) installed.
- [pgAdmin](https://www.pgadmin.org/download/) for running the PostgreSQL script.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/XT3RM1NATOR/Telegram_Bot.git
    cd interview-scheduler-bot
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    - Edit the `.env` file in the root directory. Fill out all the variables

4. Run the bot:

    ```bash
    cd src
    npx ts-node bot.ts
    ```

5. Run the PostgreSQL script in pgAdmin to set up the database.

## Usage

1. **ngrok Setup**:
   - Download and install ngrok.
   - Run `ngrok http <your_port_number>` to get a secure public URL for your local server.
   - Copy and paste the generated URL into the `.env` file as `DOMAIN`.

2. **Telegram Bot Setup**:
   - Create a bot using BotFather on Telegram.
   - Obtain the token for the created bot.
   - Insert the token into the `.env` file as `BOT_TOKEN`.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
