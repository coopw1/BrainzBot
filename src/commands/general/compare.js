const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const getAuth = require("../util/getAuth");
const pagination = require("../util/pagination");
const axios = require("axios").default;

const { devEmail } = require("../../../config.json");
const getTopStatistics = require("./util/getTopStatistics");

async function checkUser(interaction, user) {
  // Make sure that user exists
  const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
  const AUTH_HEADER = {
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
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
      required: false,
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

    if (interaction.options.get("compareuser")) {
      await checkUser(
        interaction,
        interaction.options.get("compareuser").value
      );
      if (interaction.replied) {
        return;
      }
      console.log();

      const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/similar-to/${
        interaction.options.get("compareuser").value
      }`;
      const AUTH_HEADER = {
        Authorization: `Token ${listenBrainzToken}`,
        "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
      };

      const PARAMS = {
        headers: AUTH_HEADER,
      };
      // Make request to MusicBrainz
      const response = await axios
        .get(BASE_URL, PARAMS)
        .catch(function (error) {
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

      let description = "";
      if (similarity === undefined) {
        description = `Are **0%** similar!! haha.`;
      } else {
        description = `Are **${(similarity.similarity * 100).toFixed(
          3
        )}%** similar!! Woah!`;
      }
      const embed = new EmbedBuilder({
        title: `${brainzUsername} and ${
          interaction.options.get("compareuser").value
        }...`,
        description: description,
        footer: {
          text: "Press ? to see what you don't have in common!",
        },
      });

      const questionmarkButton = new ButtonBuilder({
        customId: "showunsimilar",
        label: "?",
        style: ButtonStyle.Secondary,
      });
      // Create a row with the button
      const row = new ActionRowBuilder({
        components: [questionmarkButton],
      });

      const message = await interaction.editReply({
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
        message.edit({ components: [row] });
      }, 180_000);

      // Handle the collector
      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId === "showunsimilar") {
          row.components[0].setDisabled(true);
          message.edit({ components: [row] });
          const userTop = await getTopStatistics(
            listenBrainzToken,
            brainzUsername,
            "artists",
            "all_time",
            false,
            "",
            10
          );

          const compareUserTop = await getTopStatistics(
            listenBrainzToken,
            interaction.options.get("compareuser").value,
            "artists",
            "all_time",
            false,
            "",
            10
          );

          const userList = userTop.artists;
          const compareUserList = compareUserTop.artists;

          // Find what is in compareUserList but not in userList
          let unique = compareUserList.filter(
            (compareUser) =>
              !userList.some(
                (user) => user.artist_name === compareUser.artist_name
              )
          );

          description = description + "\n\n**Different top artists:**";
          for (let i = 0; i < unique.length; i++) {
            if (unique[i].artist_mbid !== null) {
              description += `\n**[${unique[i].artist_name}](https://listenbrainz.org/artist/${unique[i].artist_mbid})** - ${unique[i].listen_count} plays`;
            } else {
              description += `\n**${unique[i].artist_name}** - ${unique[i].listen_count} plays`;
            }
          }

          embed.setDescription(description);
          embed.setFooter({ text: "Enjoy!" });

          interaction.editReply({ embeds: [embed] });
          buttonInteraction.deferUpdate();
        }
      });
    } else {
      const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/similar-users`;
      const AUTH_HEADER = {
        Authorization: `Token ${listenBrainzToken}`,
        "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
      };

      const PARAMS = {
        headers: AUTH_HEADER,
      };
      // Make request to MusicBrainz
      const response = await axios
        .get(BASE_URL, PARAMS)
        .catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
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

      const similarUsers = response.data.payload;

      const maxPages = Math.ceil(similarUsers.length / 10);

      let descriptions = [];

      for (let i = 0; i < maxPages; i++) {
        descriptions[i] = "";
      }

      similarUsers.forEach((user, index) => {
        descriptions[Math.floor(index / 10)] =
          descriptions[Math.floor(index / 10)] +
          `**[${user.user_name}](https://listenbrainz.org/user/${
            user.user_name
          }/)** - ${(user.similarity * 100).toFixed(3)}%\n`;
      });

      let baseEmbed = {
        title: `Similar users for ${brainzUsername}`,
        color: 0x353070,
      };

      let embeds = [];
      for (let i = 0; i < maxPages; i++) {
        embeds[i] = new EmbedBuilder(baseEmbed).setDescription(descriptions[i]);
      }
      pagination(interaction, embeds, maxPages);
    }
  },
};
