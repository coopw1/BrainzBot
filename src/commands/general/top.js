const { ApplicationCommandOptionType } = require("discord.js");
const { getTopArtists } = require("./util/getTopStatistics");

module.exports = {
  name: "top",
  description: "Display top scrobbles!",
  category: "General",
  options: [
    {
      name: "artists",
      description: "Show your most listened to artists",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "user",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
    },
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    // Get user data from database
    const currentUserData = await userData.findOne({
      userID: interaction.user.id,
    });

    if (currentUserData === null) {
      const embed = new EmbedBuilder()
        .setDescription(
          "❌ You have not linked your ListenBrainz account yet!\n" +
            "Use the </login:1190736297770352801> command to link your ListenBrainz account."
        )
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;
    await getTopArtists(listenBrainzToken, brainzUsername, "week");
  },
};
