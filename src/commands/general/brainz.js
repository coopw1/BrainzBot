const { EmbedBuilder } = require("discord.js");
const userData = require("../../../schemas/userData");
const axios = require("axios").default;

module.exports = {
  name: "brainz",
  description: "Now Playing - Shows your currently playing track!",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    // Get ListenBrainz username from the database
    const brainzUsername = (
      await userData.findOne(
        { userID: interaction.user.id },
        "ListenBrainzUsername"
      )
    ).ListenBrainzUsername;

    // Get ListenBrainz token from the database
    const listenBrainzToken = (
      await userData.findOne(
        { userID: interaction.user.id },
        "ListenBrainzToken"
      )
    ).ListenBrainzToken;

    let response;
    // Get current track from ListenBrainz API
    try {
      BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/playing-now`;
      AUTH_HEADER = {
        Authorization: `Token ${listenBrainzToken}`,
      };

      // Make request to ListenBrainz
      response = await axios.get(BASE_URL, {
        headers: AUTH_HEADER,
      });
    } catch (error) {
      console.log("Error: " + error);
    }

    // Create base embed
    const embed = new EmbedBuilder({
      author: {
        iconURL: interaction.user.displayAvatarURL(),
      },
      color: 0xba0000,
    });
    // Check if no track is playing
    if (!response.data.payload.count) {
      // Get most recent listen from ListenBrainz API instead
      try {
        BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listens`;
        AUTH_HEADER = {
          Authorization: `Token ${listenBrainzToken}`,
        };

        // Make request to ListenBrainz
        listensresponse = await axios.get(BASE_URL, {
          headers: AUTH_HEADER,
        });

        // Add last track info to embed
        embed
          .setDescription(
            `**${listensresponse.data.payload.listens[0].track_metadata.track_name}** - ${listensresponse.data.payload.listens[0].track_metadata.artist_name}`
          )
          .setAuthor({
            name: `Last track for ${brainzUsername}`,
          });
      } catch (error) {
        console.log("Error: " + error);
      }
    } else {
      // Add track info to embed
      embed
        .setDescription(
          `**${response.data.payload.listens[0].track_metadata.track_name}** - ${response.data.payload.listens[0].track_metadata.artist_name}`
        )
        .setAuthor({
          name: `Now playing - ${brainzUsername}`,
        });
    }

    // Get total scrobbles
    try {
      BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listen-count`;
      AUTH_HEADER = {
        Authorization: `Token ${listenBrainzToken}`,
      };

      // Make request to ListenBrainz
      response = await axios.get(BASE_URL, {
        headers: AUTH_HEADER,
      });

      // Add total scrobbles to embed
      embed.setFooter({
        text: `${response.data.payload.count} total scrobbles`,
      });
    } catch (error) {
      console.log("Error: " + error);
    }

    // Send embed
    interaction.reply({ embeds: [embed] });
  },
};
