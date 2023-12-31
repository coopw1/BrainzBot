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

    // Check if no track is playing
    if (!response.data.track) {
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

        // Create an embed with the most recent listen
        const embed = new EmbedBuilder({
          author: {
            name: `Last track for ${interaction.user.displayName}`,
            iconURL: interaction.user.displayAvatarURL(),
          },
          color: 0xba0000,
          description: `**${listensresponse.data.payload.listens[0].track_metadata.track_name}** - ${listensresponse.data.payload.listens[0].track_metadata.artist_name}`,
        });

        // Send embed
        interaction.reply({ embeds: [embed] });

        // console.log(listensresponse.data.payload.listens);
      } catch (error) {
        console.log("Error: " + error);
      }
    } else {
      // Create an embed with the current track
      const embed = new EmbedBuilder({
        author: {
          name: `Now playing - ${interaction.user.displayName}`,
          iconURL: interaction.user.displayAvatarURL(),
        },
        color: 0xba0000,
      });
      // Add track info to embed
      embed.setDescription(
        `**${response.data.payload.listens[0].track_metadata.track_name}** - ${response.data.payload.listens[0].track_metadata.artist_name}`
      );

      // Send embed
      interaction.reply({ embeds: [embed] });

      console.log(response.data.payload.listens[0].track_metadata.track_name);
    }
  },
};
