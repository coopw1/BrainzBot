<div align="center">

# BrainzBot

![GitHub License](https://img.shields.io/github/license/coopw1/BrainzBot?style=for-the-badge&color=blue)
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/coopw1/BrainzBot?style=for-the-badge)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/w/coopw1/BrainzBot?style=for-the-badge)
![Discord](https://img.shields.io/discord/1192335741833977916?style=for-the-badge&link=https%3A%2F%2Fdiscord.gg%2FgKdHvFKfCa&color=5865F2)

BrainzBot is a .fmbot inspired discord bot for [ListenBrainz](https://listenbrainz.org). You can add it to your server using [this link](https://discord.com/oauth2/authorize?client_id=1191438412159389806&permissions=414464658496&scope=bot)

Have any questions or just want to try out the bot? Join the discord server [here!](https://discord.com/invite/gKdHvFKfCa)

</div>

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
   - Required fields (.env only)
     - TOKEN - you need to create a [Discord Developer Application](https://discord.com/developers/applications)
     - DATABASE_URL - [MongoDB database](https://www.mongodb.com/), either self-hosted or through atlas.
     - LISTENBRAINZ_TOKEN - Your own [ListenBrainz Token](https://listenbrainz.org/profile/)
5. Run the bot!
   ```
   npm run start
   ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
