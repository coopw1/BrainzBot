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

const axios = require("axios").default;
const userData = require("../../../schemas/userData");

module.exports = {
  name: "login",
  description:
    "Gives you a link to connect your ListenBrainz account to brainzbot",
  options: [
    {
      name: "token",
      description: "Enter your ListenBrainz User token",
      type: ApplicationCommandOptionType.String,
      required: true,
      minLength: 36,
      maxLength: 36,
    },
  ],

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
      let response;

      try {
        BASE_URL = "https://api.listenbrainz.org/1/validate-token";
        AUTH_HEADER = {
          Authorization: `Token ${token}`,
        };

        response = await axios.get(BASE_URL, {
          headers: AUTH_HEADER,
        });
      } catch (error) {
        console.log("Error: " + error);
      }

      if (response.data.valid) {
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

        // Send confirmation
        const embed = new EmbedBuilder()
          .setDescription(
            `✅ You have been logged in to .fmbot with the username [${response.data.user_name}](https://listenbrainz.org/user/${response.data.user_name}/)!`
          )
          .setColor("32cd32");
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
