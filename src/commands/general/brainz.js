const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const axios = require("axios").default;
require("dotenv").config();

const userData = require("../../../schemas/userData");
const getCurrentlyPlaying = require("./util/getCurrentlyPlaying");
const getRecentlyPlayed = require("./util/getRecentlyPlayed");
const getMBID = require("./util/getMBID");
const getAlbumCover = require("./util/getAlbumCover");
const getTotalScrobbles = require("./util/getTotalScrobbles");
const getSongInfo = require("./util/getSongInfo");

module.exports = {
  name: "brainz",
  description: "Now Playing - Shows your currently playing track!",
  category: "General",
  options: [
    {
      name: "username",
      description: "A ListenBrainz username",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  callback: async (client, interaction) => {
    // Get user data from database
    const currentUserData = await userData.findOne({
      userID: interaction.user.id,
    });

    // Check if username is provided through command or DB
    if (currentUserData === null && !interaction.options.get("username")) {
      // No username provided
      const embed = new EmbedBuilder()
        .setDescription(
          "❌ You must link your ListenBrainz account to use this command without specifying a username!\n" +
            "Use the </login:1190736297770352801> command to link your ListenBrainz account."
        )
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (interaction.options.get("username")) {
      // Username provided

      // Make sure that user exists
      const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
      const AUTH_HEADER = {
        Authorization: `Token ${process.env.LISTENBRAINZ_TOKEN}`,
      };

      const PARAMS = {
        params: {
          search_term: interaction.options.get("username").value,
        },
        headers: AUTH_HEADER,
      };

      const response = await axios.get(BASE_URL, PARAMS);

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
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
    }
    await interaction.deferReply();

    let brainzUsername;
    let listenBrainzToken;
    // Check if username is provided through command
    if (interaction.options.get("username")) {
      // Get username from command
      brainzUsername = interaction.options.get("username").value;
      // Use coopw-DiscordBrainzBot's token
      listenBrainzToken = process.env.LISTENBRAINZ_TOKEN;
    } else {
      // Get username from DB
      brainzUsername = currentUserData.ListenBrainzUsername;
      listenBrainzToken = currentUserData.ListenBrainzToken;
    }

    // Get currently playing track from ListenBrainz API
    const currentlyPlaying = await getCurrentlyPlaying(
      listenBrainzToken,
      brainzUsername
    );

    // Create base embed
    const embed = new EmbedBuilder({
      color: 0x353070,
    });

    let MBID;
    // Check if a track is playing
    if (currentlyPlaying.count) {
      // Track is playing
      // Get Song info
      const songInfo = await getSongInfo(
        currentlyPlaying.listens[0].track_metadata?.artist_name,
        currentlyPlaying.listens[0].track_metadata?.release_name,
        currentlyPlaying.listens[0].track_metadata?.track_name
      );

      if (songInfo?.recording_name === undefined) {
        // Song info is empty
        // Add track info to embed
        embed
          .setTitle(`${currentlyPlaying.listens[0].track_metadata.track_name}`)
          .setDescription(
            `**${currentlyPlaying.listens[0].track_metadata.artist_name}** - *${currentlyPlaying.listens[0].track_metadata?.release_name}*`
          )
          .setAuthor({
            iconURL: interaction.user.displayAvatarURL(),
            name: `Now playing - ${brainzUsername}`,
          });
      } else {
        // Song info is not empty
        // Add track info to embed
        embed
          .setTitle(`${songInfo.recording_name}`)
          .setURL(
            `https://musicbrainz.org/recording/${songInfo.recording_mbid}`
          )
          .setDescription(
            `**[${songInfo.artist_credit_name}](https://listenbrainz.org/artist/${songInfo.artist_mbids[0]})** - *[${songInfo.release_name}](https://musicbrainz.org/release/${songInfo.release_mbid})*`
          )
          .setAuthor({
            iconURL: interaction.user.displayAvatarURL(),
            name: `Now playing - ${brainzUsername}`,
          });

        MBID = songInfo.recording_mbid;
      }

      // Get total scrobbles
      totalScrobbles = await getTotalScrobbles(
        listenBrainzToken,
        brainzUsername
      );
      // Add total scrobbles to embed
      embed.setFooter({
        text: `${totalScrobbles} total scrobbles`,
      });
    } else {
      // Track is not playing
      // Get most recent listen from ListenBrainz API instead
      const mostRecentlyPlayed = await getRecentlyPlayed(
        listenBrainzToken,
        brainzUsername
      );

      // Get MBID
      const MBID =
        mostRecentlyPlayed.listens[0].track_metadata?.mbid_mapping
          ?.recording_mbid;

      // Add track info to embed
      if (
        mostRecentlyPlayed.listens[0].track_metadata?.mbid_mapping
          ?.recording_mbid
      ) {
        embed
          .setTitle(
            `${mostRecentlyPlayed.listens[0].track_metadata.track_name}`
          )
          .setURL(`https://musicbrainz.org/recording/${MBID}`)
          .setDescription(
            `**${mostRecentlyPlayed.listens[0].track_metadata.artist_name}** - *${mostRecentlyPlayed.listens[0].track_metadata?.release_name}*`
          )
          .setAuthor({
            iconURL: interaction.user.displayAvatarURL(),
            name: `Last track for ${brainzUsername}`,
          });
      } else {
        embed
          .setTitle(
            `${mostRecentlyPlayed.listens[0].track_metadata.track_name}`
          )
          .setDescription(
            `**${mostRecentlyPlayed.listens[0].track_metadata.artist_name}** - *${mostRecentlyPlayed.listens[0].track_metadata?.release_name}*`
          )
          .setAuthor({
            iconURL: interaction.user.displayAvatarURL(),
            name: `Last track for ${brainzUsername}`,
          });
      }

      // Get time of last scrobble
      const lastScrobble = new Date(mostRecentlyPlayed.latest_listen_ts * 1000);
      // Add time of last scrobble to embed
      embed.setTimestamp(lastScrobble);

      // Get total scrobbles
      totalScrobbles = await getTotalScrobbles(
        listenBrainzToken,
        brainzUsername
      );
      // Add total scrobbles to embed
      embed.setFooter({
        text: `${totalScrobbles} total scrobbles\n` + `Last scrobble `,
      });
    }

    if (!(MBID === undefined)) {
      // Get thumbnail from MBID
      albumCover = await getAlbumCover(MBID);
      // Add thumbnail
      embed.setThumbnail(albumCover);
    }

    // Send embed
    interaction.editReply({ embeds: [embed] });
  },
};
