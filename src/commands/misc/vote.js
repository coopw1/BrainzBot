const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const getVoteStatus = require("../../utils/getVoteStatus");
require("dotenv").config();

module.exports = {
  name: "vote",
  description: "Vote for the bot!!",
  category: "Misc",
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

  callback: async (client, interaction) => {
    const votedStatus = getVoteStatus(interaction);

    if (votedStatus === true) {
      const embed = new EmbedBuilder({
        title: "You have already voted!",
        description: "You can only vote once every 12 hours.",
        footer: {
          text: "Thanks for being cool, this helps more people find ListenBrainz!",
        },
        color: 0x353070,
      });

      const button = new ButtonBuilder({
        label: "Vote!",
        url: "https://top.gg/bot/1191438412159389806/vote",
        style: ButtonStyle.Link,
      });
      const row = new ActionRowBuilder({
        components: [button],
      });

      interaction.reply({ embeds: [embed], components: [row] });
    } else {
      const embed = new EmbedBuilder({
        title: "Click the button below to vote!",
        footer: {
          text: "Thanks for being cool, this helps more people find ListenBrainz!",
        },
        color: 0x353070,
      });

      const button = new ButtonBuilder({
        label: "Vote!",
        url: "https://top.gg/bot/1191438412159389806/vote",
        style: ButtonStyle.Link,
      });
      const row = new ActionRowBuilder({
        components: [button],
      });

      interaction.reply({ embeds: [embed], components: [row] });
    }
  },
};
