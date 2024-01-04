const { EmbedBuilder } = require("discord.js");

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
    let seconds = Math.floor(totalSeconds % 60);
    let uptime = `${days}d, ${hours}h, ${minutes}m and ${seconds}s`;
    console.log(uptime);

    // Get ListenBrainz API ping
    // let LBping;
    // request(
    //   {
    //     uri: "https://api.listenbrainz.org/1/latest-import/",
    //     method: "GET",
    //     time: true,
    //   },
    //   (err, resp) => {
    //     LBping = resp.timings.end;
    //   }
    // );

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
          value: `**Total Users:** ${totalUsers}\n**Guilds:** ${guildCount}\n**Ping:** ${LBping}ms`,
        },
      ],
    });

    // Send embed
    interaction.reply({ embeds: [embed] });
  },
};
