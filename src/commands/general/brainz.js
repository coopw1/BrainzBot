const { EmbedBuilder } = require("discord.js");
const axios = require("axios").default;

const userData = require("../../../schemas/userData");
const getCurrentlyPlaying = require("./util/getCurrentlyPlaying");
const getMostRecentlyPlayed = require("./util/getMostRecentlyPlayed");
const getMBID = require("./util/getMBID");

module.exports = {
  name: "brainz",
  description: "Now Playing - Shows your currently playing track!",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    // Get user data from database
    const currentUserData = await userData.findOne({
      userID: interaction.user.id,
    });

    if (currentUserData === null) {
      const embed = new EmbedBuilder()
        .setDescription(
          "❌ You have not linked your ListenBrainz account yet!\n" +
            "Use the </login:1190736297770352801> command to link your ListenBrainz account."
        )
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;
    let MBID;

    // Get currently playing track from ListenBrainz API
    currentlyPlaying = await getCurrentlyPlaying(
      listenBrainzToken,
      brainzUsername
    );

    // Create base embed
    const embed = new EmbedBuilder({
      color: 0xba0000,
    });
    // Check if a track is playing
    if (currentlyPlaying.count) {
      // Track is playing
      // Get MBID
      MBID = await getMBID(
        currentlyPlaying.listens[0].track_metadata.artist_name,
        currentlyPlaying.listens[0].track_metadata.release_name,
        currentlyPlaying.listens[0].track_metadata.track_name
      );

      // Add track info to embed
      embed
        .setTitle(`${currentlyPlaying.listens[0].track_metadata.track_name}`)
        .setURL(`https://musicbrainz.org/recording/${MBID}`)
        .setDescription(
          `**${currentlyPlaying.listens[0].track_metadata.artist_name}** - ${currentlyPlaying.listens[0].track_metadata.release_name}`
        )
        .setAuthor({
          iconURL: interaction.user.displayAvatarURL(),
          name: `Now playing - ${brainzUsername}`,
        });
    } else {
      // Track is not playing
      // Get most recent listen from ListenBrainz API instead
      mostRecentlyPlayer = await getMostRecentlyPlayed(
        listenBrainzToken,
        brainzUsername
      );

      // Add last track info to embed
      embed
        .setDescription(
          `**${mostRecentlyPlayer.listens[0].track_metadata.track_name}** - ${mostRecentlyPlayer.listens[0].track_metadata.artist_name}`
        )
        .setAuthor({
          iconURL: interaction.user.displayAvatarURL(),
          name: `Last track for ${brainzUsername}`,
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

    // Add thumbnail
    embed.setThumbnail(
      "https://ia601506.us.archive.org/25/items/mbid-34bcb239-ae92-409a-82a0-2aa74a591ec5/mbid-34bcb239-ae92-409a-82a0-2aa74a591ec5-35224645978.png"
    );

    // Send embed
    interaction.editReply({ embeds: [embed] });
  },
};
