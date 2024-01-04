# BrainzBot

BrainzBot is a .fmbot inspired discord bot for [ListenBrainz](https://listenbrainz.org). You can add it to your server using [this link](https://discord.com/oauth2/authorize?client_id=1191438412159389806&permissions=414464658496&scope=bot)

## About the bot
This bot was created mostly as a way for me to get motivation and grow more consistant with learning how to code.

## Self-hosting

1. [Download and install node.js](https://nodejs.org/en/download) if you don't already have it.
2. Clone/download this repo and go into the folder.
    ```
    git clone https://github.com/coopw1/BrainzBot
    ```
3. Install the node dependencies.
   ```
   npm install
   ```
4. Fill out .env.example and config.json.example, then rename them to .env and config.json respectively.
   * You will need to create both a [Discord Developer Application](https://discord.com/developers/applications) and a [MongoDB database](https://www.mongodb.com/), either self-hosted or through atlas.
6. Run the bot!
   ```
   npm run start
   ```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
