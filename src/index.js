require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");
const { AutoPoster } = require("topgg-autoposter");

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

    const ap = AutoPoster(process.env.TOPGG_TOKEN, client);
    ap.on("posted", () => {
      console.log("Posted stats to Top.gg!");
    });

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled promise rejection:", error);
    });
  } catch (error) {
    console.error(error);
  }
})();
