const {
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");

const mongoose = require("mongoose");
const userData = require("../../../schemas/userData");

module.exports = {
  name: "login",
  description:
    "Gives you a link to connect your ListenBrainz account to brainzbot",
  // devOnly: Boolean,
  testOnly: true,
  options: [
    {
      name: "token",
      description: "Enter your ListenBrainz User token",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    if (!interaction.options.get("token")) {
      const embed = new EmbedBuilder()
        .setDescription(
          "**[Click here to get your ListenBrainz User token](https://listenbrainz.org/profile/)**\n" +
            "\n" +
            "To make a ListenBrainz account, you must sign up through MusicBrainz.\n" +
            "You can create a MusicBrainz account [here](https://musicbrainz.org/register),\n" +
            "And Sign in to ListenBrainz [here](https://listenbrainz.org/login/).\n" +
            "After that, you can [get your ListenBrainz User token](https://listenbrainz.org/profile/).\n" +
            "\n" +
            "Once you have copied your token, press the button below"
        )
        .setColor("ba0000");

      const continueButton = new ButtonBuilder({
        customId: "continue",
        label: "Continue",
        style: ButtonStyle.Primary,
      });

      const row = new ActionRowBuilder({
        components: [continueButton],
      });

      interaction.reply({ embeds: [embed], components: [row] });
    } else {
      const token = interaction.options.get("token").value;

      // Save token to DB
      try {
        const user = await userData.findOne({ userID: interaction.user.id });
        if (user) {
          await userData.findOneAndUpdate(
            { userID: interaction.user.id },
            { ListenBrainzToken: token }
          );
        } else {
          await userData.create({
            userID: interaction.user.id,
            ListenBrainzToken: token,
          });
        }
      } catch (error) {
        console.log(`Failed to save token to DB: ${error}`);
      }

      const embed = new EmbedBuilder()
        .setDescription("Logged in as " + interaction.user.tag)
        .setColor("ba0000");
      interaction.reply({ embeds: [embed] });
    }
  },
};
