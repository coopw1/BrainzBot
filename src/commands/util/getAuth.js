const { EmbedBuilder } = require("discord.js");
const axios = require("axios").default;

const userData = require("../../../schemas/userData");

const devEmail = process.env.DEV_EMAIL;

/**
 * Retrieves user data from the database and performs various checks based on the provided interaction.
 *
 * @param {Object<interaction>} interaction - The interaction containing information about the user interaction.
 * @param {boolean} noAuthNeeded - Whether to skip authentication checks.
 * @return {promise<{username: string, token: string, tokenIsUsers: boolean}>} An object containing the user's ListenBrainz username and token.
 */
module.exports = async (interaction, noAuthNeeded) => {
  if (noAuthNeeded) {
    return {};
  }

  // Get user data from database
  const currentUserData = await userData.findOne({
    userID: interaction.user.id,
  });

  let tokenIsUsers = false;
  // Check if username is provided through command or DB
  if (currentUserData === null && !interaction.options.get("user")) {
    // No username provided
    const embed = new EmbedBuilder()
      .setDescription(
        "❌ You must link your ListenBrainz account to use this command without specifying a username!\n" +
          "Use the </login:1190736297770352801> command to link your ListenBrainz account."
      )
      .setColor("ba0000");
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return {};
  } else if (interaction.options.get("user")) {
    // Username provided

    // Make sure that user exists
    const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
    const AUTH_HEADER = {
      Authorization: `Token ${process.env.LISTENBRAINZ_TOKEN}`,
      "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
    };

    const PARAMS = {
      params: {
        search_term: interaction.options.get("user").value,
      },
      headers: AUTH_HEADER,
    };

    const response = await axios.get(BASE_URL, PARAMS).catch(async (error) => {
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
    if (!(userResponse === interaction.options.get("user").value)) {
      // User doesn't exist
      const embed = new EmbedBuilder()
        .setDescription(
          `❌ User ${interaction.options.get("user").value} doesn't exist.`
        )
        .setColor("ba0000");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return {};
    }
  }

  await interaction.deferReply();

  let brainzUsername;
  let listenBrainzToken;
  // Check if username is provided through command
  if (interaction.options.get("user") && !currentUserData?.ListenBrainzToken) {
    // Get username from command
    brainzUsername = interaction.options.get("user").value;
    // Use coopw-DiscordBrainzBot's token
    listenBrainzToken = process.env.LISTENBRAINZ_TOKEN;
  } else if (!currentUserData.ListenBrainzToken) {
    // Get username from DB
    brainzUsername = currentUserData.ListenBrainzUsername;
    listenBrainzToken = process.env.LISTENBRAINZ_TOKEN;
  } else if (interaction.options.get("user")) {
    // Get username from command
    brainzUsername = interaction.options.get("user").value;
    listenBrainzToken = currentUserData.ListenBrainzToken;
  } else {
    // Get username from DB
    brainzUsername = currentUserData.ListenBrainzUsername;
    listenBrainzToken = currentUserData.ListenBrainzToken;
    tokenIsUsers = true;
  }

  return { brainzUsername, listenBrainzToken, tokenIsUsers };
};
