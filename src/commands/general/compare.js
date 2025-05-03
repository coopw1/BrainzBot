const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  SystemChannelFlagsBitField,
} = require("discord.js");
const getAuth = require("../util/getAuth");
const pagination = require("../util/pagination");
const axios = require("axios").default;

const devEmail = process.env.DEV_EMAIL;
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
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

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

      const userArtistsFull = await getTopStatistics(
        listenBrainzToken,
        brainzUsername,
        "artists",
        "all_time",
        false,
        null,
        1000
      );

      const compareUserArtistsFull = await getTopStatistics(
        listenBrainzToken,
        interaction.options.get("compareuser").value,
        "artists",
        "all_time",
        false,
        null,
        1000
      );

      const userTopArists = await userArtistsFull.artists;
      const compareUserTopArtists = await compareUserArtistsFull.artists;

      let max = 1000;
      let count = 0;
      let commonArtists = [];

      if (userTopArists.length < 1000 || compareUserTopArtists.length < 1000) {
        max = Math.min(userTopArists.length, compareUserTopArtists.length);
      }
      for (let i = 0; i < max; i++) {
        for (let j = 0; j < max; j++) {
          if (
            userTopArists[i].artist_name ===
            compareUserTopArtists[j].artist_name
          ) {
            count++;
            commonArtists.push({
              artistName: userTopArists[i].artist_name,
              artistMBID: userTopArists[i].artist_mbid,
              userListenCount: userTopArists[i].listen_count,
              compareUserListenCount: compareUserTopArtists[j].listen_count,
            });
            break;
          }
        }
      }

      const similarity = count / max;
      console.log(count + " / " + max + " = " + similarity);

      let description = `Are **${(similarity * 100).toFixed(
        2
      )}%** similar!! Woah!`;
      const embed = new EmbedBuilder({
        title: `${brainzUsername} and ${
          interaction.options.get("compareuser").value
        }...`,
        description: description,
        footer: {
          text: "Press ? to see what you have in common!",
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
        interaction.editReply({ components: [row] });
      }, 180_000);

      // Handle the collector
      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.customId === "showunsimilar") {
          row.components[0].setDisabled(true);
          buttonInteraction.update({ components: [row] });

          description = description + "\n\n**Similar top artists:**";
          for (let i = 0; i < 10; i++) {
            if (commonArtists[i].artistMBID !== null) {
              description += `\n**[${commonArtists[i].artistName}](https://listenbrainz.org/artist/${commonArtists[i].artistMBID})** - ${commonArtists[i].userListenCount} vs ${commonArtists[i].compareUserListenCount} plays`;
            } else {
              description += `\n**$${commonArtists[i].artistName}** - ${commonArtists[i].userListenCount} vs ${commonArtists[i].compareUserListenCount} plays`;
            }
          }

          embed.setDescription(description);
          embed.setFooter({ text: "Enjoy!" });

          interaction.editReply({ embeds: [embed] });
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
