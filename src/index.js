require("dotenv").config();
const { Client, IntentsBitField, ActivityType } = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");

const port = process.env.PORT || 3000;
const http = require("http");

const server = http.createServer((req, res) => {
  // Your request handling logic goes here
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!\n");
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DATABASE_URL);
    if (mongoose.connect) {
      console.log("Connected to MongoDB.");
    }

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.error(error);
  }
})();
