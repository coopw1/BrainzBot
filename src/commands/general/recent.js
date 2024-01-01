const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const userData = require("../../../schemas/userData");
const getRecentlyPlayed = require("./util/getRecentlyPlayed");

module.exports = {
  name: "recent",
  description: "Get your recent listens",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
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
    }

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;

    // Get recently played tracks from ListenBrainz API
    const recentlyPlayed = getRecentlyPlayed(listenBrainzToken, brainzUsername);

    let currentPage = 0;

    //Create embed for each page, 5 listens each
    const recent1to5Embed = new EmbedBuilder({
      color: 0x353070,
      description: "Your recent listens:",
    });
    const recent6to10Embed = new EmbedBuilder({
      color: 0x353070,
      description: "Your recent listens:",
    });
    const recent11to15Embed = new EmbedBuilder({
      color: 0x353070,
      description: "Your recent listens:",
    });
    const recent16to20Embed = new EmbedBuilder({
      color: 0x353070,
      description: "Your recent listens:",
    });
    const recent21to15Embed = new EmbedBuilder({
      color: 0x353070,
      description: "Your recent listens:",
    });

    // Create list of embeds
    const embeds = [
      recent1to5Embed,
      recent6to10Embed,
      recent11to15Embed,
      recent16to20Embed,
      recent21to15Embed,
    ];

    // Create left and right buttons
    const leftButton = new ButtonBuilder({
      customId: "left",
      label: "Left",
      style: ButtonStyle.Primary,
    });

    const rightButton = new ButtonBuilder({
      customId: "right",
      label: "Right",
      style: ButtonStyle.Primary,
    });

    // Create a row with the buttons
    const row = new ActionRowBuilder({
      components: [leftButton, rightButton],
    });

    // Send embed
    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [row],
    });

    // Create a collector that waits for the user to click the button
    const buttonCollectorFilter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      ComponentType: ComponentType.Button,
      filter: buttonCollectorFilter,
    });

    // Handle the collector
    collector.on("collect", async (i) => {
      // Check if the button was continue
      if (i.customId === "left") {
        // User clicked left
        // Check if first page is active to switch to last
        if (currentPage === 0) {
          // Switch to last page
          currentPage = 4;
        } else {
          // Switch to previous page
          currentPage--;
        }
        // Edit embed to show previous 5 listens
        await interaction.editReply({ embeds: [embeds[currentPage]] });
      } else if (i.customId === "right") {
      }
    });
  },
};
