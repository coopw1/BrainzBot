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
    // Create an embed with the current track
    const embed = new EmbedBuilder({
      author: {
        name: `Now playing - ${interaction.user.displayName}`,
        iconURL: interaction.user.displayAvatarURL(),
      },
      color: "ba0000",
    });

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

    // // Add track info to embed
    // embed
    //   .setTitle(response.data.track.title)
    //   .setURL(response.data.track.url)
    //   .setThumbnail(response.data.track.thumb);

    console.log(response.data.payload.listens);
  },
};
