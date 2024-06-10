const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const axios = require("axios").default;

const userData = require("../../../schemas/userData");

const { devEmail } = require("../../../config.json");

module.exports = {
  name: "settings",
  description: "Get your user settings",
  category: "Settings",
  options: [
    {
      name: "user",
      description: "Save your ListenBrainz username without needing a token!",
      type: ApplicationCommandOptionType.Subcommand,
      required: false,
      options: [
        {
          name: "username",
          description: "Enter your ListenBrainz Username",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],

  callback: async (client, interaction) => {
    if (interaction.options.getSubcommand() === "user") {
      const currentUserData = await userData.findOne({
        userID: interaction.user.id,
      });
      if (currentUserData?.ListenBrainzToken) {
        const embed = new EmbedBuilder()
          .setDescription(
            "❌ You have already logged in with /login!\n" +
              "Use the </login:1190736297770352801> command to change the account you are logged in to."
          )
          .setColor("ba0000");
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        // Make sure that user exists
        const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
        const AUTH_HEADER = {
          Authorization: `Token ${process.env.LISTENBRAINZ_TOKEN}`,
          "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
        };

        const PARAMS = {
          params: {
            search_term: interaction.options.get("username").value,
          },
          headers: AUTH_HEADER,
        };

        const response = await axios
          .get(BASE_URL, PARAMS)
          .catch(async (error) => {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `❌ Error: ${error.response.data.message}\n` +
                      `Please DM @coopw to report this error.`
                  )
                  .setColor("ba0000"),
              ],
              ephemeral: true,
            });
          });

        const userResponse = response.data.users[0].user_name;
        if (!(userResponse === interaction.options.get("username").value)) {
          // User doesn't exist
          const embed = new EmbedBuilder()
            .setDescription(
              `❌ User ${
                interaction.options.get("username").value
              } doesn't exist.`
            )
            .setColor("ba0000");
          await interaction.reply({ embeds: [embed], ephemeral: true });
          return {};
        }

        try {
          const user = await userData.findOne({ userID: interaction.user.id });
          // Check if user is already in DB
          if (user) {
            // Update token if user is already in DB
            await userData.findOneAndUpdate(
              { userID: interaction.user.id },
              {
                ListenBrainzUsername: interaction.options.get("username").value,
              }
            );
          } else {
            // Create new user if user is not in DB
            await userData.create({
              userID: interaction.user.id,
              ListenBrainzUsername: interaction.options.get("username").value,
            });
          }
        } catch (error) {
          console.log(`Failed to save token to DB: ${error}`);
        }

        // Send confirmation
        const embed = new EmbedBuilder()
          .setDescription(
            `✅ Your username has been saved as [${
              interaction.options.get("username").value
            }](https://listenbrainz.org/user/${
              interaction.options.get("username").value
            })`
          )
          .setColor("32cd32");
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
