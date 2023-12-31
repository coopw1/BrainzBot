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
      required: false,
      minLength: 36,
      maxLength: 36,
    },
  ],

  callback: async (client, interaction) => {
    // Check if user has provided a token
    if (!interaction.options.get("token")) {
      // No token provided
      // Send an embed with instructions
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

      // Create a button with the label "Continue"
      const continueButton = new ButtonBuilder({
        customId: "continue",
        label: "Continue",
        style: ButtonStyle.Primary,
      });

      // Create a row with the button
      const row = new ActionRowBuilder({
        components: [continueButton],
      });

      // Send the embed and row
      interaction.reply({ embeds: [embed], components: [row] });
    } else {
      // Token provided

      const token = interaction.options.get("token").value;
      let response;

      try {
        BASE_URL = "https://api.listenbrainz.org/1/validate-token";
        AUTH_HEADER = {
          Authorization: `Token ${token}`,
        };

        // Make request to ListenBrainz
        response = await axios.get(BASE_URL, {
          headers: AUTH_HEADER,
        });
      } catch (error) {
        console.log("Error: " + error);
      }

      // Check if token is valid
      if (response.data.valid) {
        // Token is valid
        // Save token to DB
        try {
          const user = await userData.findOne({ userID: interaction.user.id });
          // Check if user is already in DB
          if (user) {
            // Update token if user is already in DB
            await userData.findOneAndUpdate(
              { userID: interaction.user.id },
              { ListenBrainzToken: token }
            );
          } else {
            // Create new user if user is not in DB
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
      } else {
        // Token is not valid
        // Send error
        const embed = new EmbedBuilder()
          .setDescription("❌ Invalid token. Please try again.")
          .setColor("ba0000");
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
