const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const userData = require("../../../schemas/userData");

module.exports = {
  name: "info",
  description: "Info",
  category: "Misc",

  callback: async (client, interaction) => {
    const allUserData = await userData.find();
    const totalUsers = allUserData.length;
    const guildCount = await client.guilds.cache.size;

    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = (totalSeconds % 60).toPrecision(3);
    let uptime = `${minutes}m, ${seconds}s`;
    if (hours > 0) {
      let uptime = `${hours}h, ${minutes}m, ${seconds}s`;
    }
    if (days > 0) {
      let uptime = `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
    }

    // Get ListenBrainz API ping
    let LBping;
    const BASE_URL = "https://api.listenbrainz.org/1/stats/sitewide/artists";
    const instance = axios.create();

    instance.interceptors.request.use((config) => {
      config.headers["request-startTime"] = process.hrtime();
      return config;
    });

    instance.interceptors.response.use((response) => {
      const start = response.config.headers["request-startTime"];
      const end = process.hrtime(start);
      const milliseconds = Math.round(end[0] * 1000 + end[1] / 1000000);
      response.headers["request-duration"] = milliseconds;
      return response;
    });

    instance
      .get(BASE_URL)
      .then((response) => {
        LBPing = response.headers["request-duration"];
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
      });

    const embed = new EmbedBuilder({
      author: {
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      },
      fields: [
        {
          name: "Links",
          value:
            "[Github](https://github.com/coopw1/BrainzBot)\n" +
            "[Support Server](https://discord.gg/gKdHvFKfCa)\n" +
            "[Invite Bot](https://discord.com/oauth2/authorize?client_id=1191438412159389806&permissions=414464658496&scope=bot)\n",
        },
        {
          name: "Stats",
          value: client.guilds.cache.reduce(
            (acc, guild) => acc + guild.memberCount,
            0
          ),
        },
      ],
    });

    // Send embed
    interaction.reply({ embeds: [embed] });
  },
};
