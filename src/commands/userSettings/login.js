const {
  EmbedBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");

const axios = require("axios").default;
const userData = require("../../../schemas/userData");

module.exports = {
  name: "login",
  description:
    "Gives you a link to connect your ListenBrainz account to BrainzBot",
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
  category: "Settings",

  callback: async (client, interaction) => {
    // Check if user has provided a token
    if (!interaction.options.get("token")) {
      // No token provided
      // Create an embed with instructions
      const embed = new EmbedBuilder()
        .setDescription(
          "**[Click here to get your ListenBrainz User token](https://listenbrainz.org/profile/)**\n\n" +
            "Once you have copied your token, press the button below"
        )
        .setColor(0x353070);

      // Create a button with the label "Continue"
      const continueButton = new ButtonBuilder({
        customId: "continue",
        label: "Continue",
        style: ButtonStyle.Primary,
      });
      const questionmarkButton = new ButtonBuilder({
        customId: "questionmark",
        label: "?",
        style: ButtonStyle.Secondary,
      });

      // Create a row with the button
      const row = new ActionRowBuilder({
        components: [continueButton, questionmarkButton],
      });

      // Send the embed and row
      const message = await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      // Create a collector that waits for the user to click the button
      const buttonCollectorFilter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter: buttonCollectorFilter,
        time: 180_000,
      });

      setTimeout(function () {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        message.edit({ components: [row] });
      }, 180_000);

      // Handle the collector
      collector.on("collect", async (buttonInteraction) => {
        // Check if the button was continue
        if (buttonInteraction.customId === "continue") {
          // User clicked continue

          // Generate a random customId
          const randomCustomId = Math.random().toString(36).slice(2);

          // Create a modal
          const modal = new ModalBuilder({
            title: "ListenBrainz User Token",
            customId: randomCustomId,
          });

          // Create a text input with a random customId
          const tokenInput = new TextInputBuilder({
            customId: "ListenBrainzToken",
            label: "Enter your ListenBrainz User token",
            style: TextInputStyle.Short,
            required: true,
            minLength: 36,
            maxLength: 36,
          });
          // Create a row with the text input
          const row = new ActionRowBuilder().addComponents(tokenInput);

          // Add the text input to the modal
          modal.addComponents(row);

          // Send the modal
          await buttonInteraction.showModal(modal);

          // Create a collector that waits for the user to submit the modal
          const modalCollectorFilter = (modali) =>
            modali.user.id === buttonInteraction.user.id &&
            modali.customId === randomCustomId;
          buttonInteraction
            .awaitModalSubmit({ time: 60_000, filter: modalCollectorFilter })
            .then(async (i) => {
              // User submitted the modal

              const token = i.fields.getTextInputValue("ListenBrainzToken");
              let response;

              try {
                const BASE_URL =
                  "https://api.listenbrainz.org/1/validate-token";
                const AUTH_HEADER = {
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
                  const user = await userData.findOne({ userID: i.user.id });
                  // Check if user is already in DB
                  if (user) {
                    // Update token if user is already in DB
                    await userData.findOneAndUpdate(
                      { userID: i.user.id },
                      {
                        ListenBrainzToken: token,
                        ListenBrainzUsername: response.data.user_name,
                      }
                    );
                  } else {
                    // Create new user if user is not in DB
                    await userData.create({
                      userID: i.user.id,
                      ListenBrainzToken: token,
                      ListenBrainzUsername: response.data.user_name,
                    });
                  }
                } catch (error) {
                  console.log(`Failed to save token to DB: ${error}`);
                }

                // Send confirmation
                const embed = new EmbedBuilder()
                  .setDescription(
                    `✅ You have been logged in to BrainzBot with the username [${response.data.user_name}](https://listenbrainz.org/user/${response.data.user_name}/)!`
                  )
                  .setColor("32cd32");
                i.reply({ embeds: [embed], ephemeral: true });
              } else {
                // Token is not valid
                // Send error
                const embed = new EmbedBuilder()
                  .setDescription("❌ Invalid token. Please try again.")
                  .setColor(0xf44336);
                i.reply({ embeds: [embed], ephemeral: true });
              }
            });
        } else if (buttonInteraction.customId === "questionmark") {
          // User clicked questionmark
          const embed = new EmbedBuilder()
            .setTitle("Creating an account")
            .setDescription(
              "To make a ListenBrainz account, you must sign up through MusicBrainz.\n" +
                "You can create a MusicBrainz account [here](https://musicbrainz.org/register),\n" +
                "And Sign in to ListenBrainz [here](https://listenbrainz.org/login/).\n" +
                "After that, you can [get your ListenBrainz User token](https://listenbrainz.org/profile/)."
            )
            .setColor(0xeb743b);
          const embed2 = new EmbedBuilder()
            .setTitle('"Do I need to give my token?')
            .setDescription(
              'You can also login with only your username using `/settings user username:"yourUsername"`\n' +
                "### Token \n" +
                "* Allows BrainzBot to confirm your identity with ListenBrainz.\n" +
                "* Used to make requests to ListenBrainz.\n" +
                "* Carries the risks that come with giving full access to your ListenBrainz account.\n" +
                "* Will never be shared with anyone.\n" +
                "### Username\n" +
                "* Can be used for most of the bot's functionality.\n" +
                "* Will not be able to use any functionality that requires authentication, such as liking songs.\n"
            )
            .setColor(0xeb743b);
          // Send embed
          buttonInteraction.reply({ embeds: [embed, embed2], ephemeral: true });
        }
      });
    } else {
      // Token provided

      const token = interaction.options.get("token").value;
      let response;

      try {
        const BASE_URL = "https://api.listenbrainz.org/1/validate-token";
        const AUTH_HEADER = {
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
              {
                ListenBrainzToken: token,
                ListenBrainzUsername: response.data.user_name,
              }
            );
          } else {
            // Create new user if user is not in DB
            await userData.create({
              userID: interaction.user.id,
              ListenBrainzToken: token,
              ListenBrainzUsername: response.data.user_name,
            });
          }
        } catch (error) {
          console.log(`Failed to save token to DB: ${error}`);
        }

        // Send confirmation
        const embed = new EmbedBuilder()
          .setDescription(
            `✅ You have been logged in to BrainzBot with the username [${response.data.user_name}](https://listenbrainz.org/user/${response.data.user_name}/)!`
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
