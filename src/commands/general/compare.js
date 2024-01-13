const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const getAuth = require("../util/getAuth");
const axios = require("axios").default;

async function checkUser(interaction, user) {
  // Make sure that user exists
  const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
  const AUTH_HEADER = {
    "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
  };

  const PARAMS = {
    params: {
      search_term: user,
    },
    headers: AUTH_HEADER,
  };

  const response = await axios.get(BASE_URL, PARAMS).catch(async (error) => {
    await interaction.editReply({
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
    return {};
  });

  const userResponse = response.data.users[0].user_name;
  if (!(userResponse === user)) {
    // User doesn't exist
    const embed = new EmbedBuilder()
      .setDescription(`❌ User ${user} doesn't exist.`)
      .setColor("ba0000");
    await interaction.editReply({ embeds: [embed], ephemeral: true });
    return {};
  }
}
module.exports = {
  name: "compare",
  description: "Compare your scrobbles with another user!",
  category: "General",
  options: [
    {
      name: "compareuser",
      description: "A ListenBrainz username to compare against!",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "user",
      description: "Your ListenBrainz username!",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  callback: async (client, interaction) => {
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      return;
    }

    await checkUser(interaction, interaction.options.get("compareuser").value);
    if (interaction.replied) {
      return;
    }
    console.log();

    const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/similar-to/${
      interaction.options.get("compareuser").value
    }`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
      "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
    };

    const PARAMS = {
      headers: AUTH_HEADER,
    };
    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS).catch(function (error) {
      if (error.response) {
        // Probably 404 meaning no similarity
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
    });

    const similarity = response?.data.payload;

    if (similarity === undefined) {
      const embed = new EmbedBuilder({
        title: `${brainzUsername} and ${
          interaction.options.get("compareuser").value
        }...`,
        description: `Are **0%** similar!! haha.`,
      });
      interaction.editReply({ embeds: [embed] });
    } else {
      console.log(similarity);
      const embed = new EmbedBuilder({
        title: `${brainzUsername} and ${
          interaction.options.get("compareuser").value
        }...`,
        description: `Are **${(similarity.similarity * 100).toFixed(
          3
        )}%** similar!! Woah!`,
      });
      interaction.editReply({ embeds: [embed] });
    }
  },
};
