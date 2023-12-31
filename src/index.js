require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
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

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled promise rejection:", error);
    });
  } catch (error) {
    console.error(error);
  }
})();
