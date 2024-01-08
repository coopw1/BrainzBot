const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const axios = require("axios").default;
require("dotenv").config();

const userData = require("../../../schemas/userData");
const getCurrentlyPlaying = require("./util/getCurrentlyPlaying");
const getRecentlyPlayed = require("./util/getRecentlyPlayed");
const getAlbumCover = require("./util/getAlbumCover");
const getTotalScrobbles = require("./util/getTotalScrobbles");
const getSongInfo = require("./util/getSongInfo");
const getAuth = require("../util/getAuth");

/**
 * Checks if the currently playing song matches the most recently played song.
 *
 * @param {Object} currentlyPlaying - the currently playing song information
 * @param {string} listenBrainzToken - the token for accessing ListenBrainz API
 * @param {string} brainzUsername - the username for accessing ListenBrainz API
 * @return {Promise<Object>} - the most recent song if there is a match, otherwise null
 */
async function checkRecentForMatch(
  currentlyPlaying,
  listenBrainzToken,
  brainzUsername
) {
  const mostRecentlyPlayed = await getRecentlyPlayed(
    listenBrainzToken,
    brainzUsername
  );
  const currentlyPlayingSong = currentlyPlaying.listens[0].track_metadata;
  const mostRecentSong = mostRecentlyPlayed.listens[0].track_metadata;

  if (
    (currentlyPlayingSong.artist_name.includes(mostRecentSong.artist_name) ||
      mostRecentSong.artist_name.includes(currentlyPlayingSong.artist_name)) &&
    (currentlyPlayingSong.track_name.includes(mostRecentSong.track_name) ||
      mostRecentSong.track_name.includes(currentlyPlayingSong.track_name))
  ) {
    return await mostRecentSong;
  } else {
    return null;
  }
}

/**
 * Checks if a song is loved by a user on ListenBrainz.
 *
 * @param {string} songMBID - The MusicBrainz ID of the song.
 * @param {string} songMSID - The MessyBrainz ID of the song.
 * @param {string} listenBrainzToken - The authentication token for ListenBrainz API.
 * @param {string} brainzUsername - The username of the user on ListenBrainz.
 * @return {Promise<number>} - The score indicating whether the song is loved or not (-1 if unloved, 0 if no data, 1 if loved).
 */
async function checkIfLoved(
  songMBID = "",
  songMSID = "",
  listenBrainzToken,
  brainzUsername
) {
  const BASE_URL = `https://api.listenbrainz.org/1/feedback/user/${brainzUsername}/get-feedback-for-recordings`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
  };
  const PARAMS = {
    params: {
      recording_mbids: songMBID,
      recording_msids: songMSID,
    },
    headers: AUTH_HEADER,
  };
  axios.get(BASE_URL, PARAMS).then((response) => {
    const score = response.data.feedback[0].score;
    console.log(score);
    return score;
  });
}

module.exports = {
  name: "brainz",
  description: "Now Playing - Shows your currently playing track!",
  category: "General",
  options: [
    {
      name: "user",
      description: "A ListenBrainz username",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  callback: async (client, interaction) => {
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      console.log("replied");
      return;
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

        // Check if the track has been scrobbled
        const checkMostRecentSong = await checkRecentForMatch(
          currentlyPlaying,
          listenBrainzToken,
          brainzUsername
        );
        if (checkMostRecentSong) {
          console.log(checkMostRecentSong);
        }
        const currentURL =
          currentlyPlaying.listens[0].track_metadata.additional_info
            ?.origin_url || "";
        // Add track info to embed
        embed
          .setTitle(`${currentlyPlaying.listens[0].track_metadata.track_name}`)
          .setURL(currentURL)
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

        // Check if the track has been loved
        checkIfLoved(MBID, listenBrainzToken, brainzUsername);
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
      MBID =
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
        const currentURL =
          mostRecentlyPlayed.listens[0].track_metadata.additional_info
            ?.origin_url;
        if (currentURL) {
          embed
            .setTitle(
              `${mostRecentlyPlayed.listens[0].track_metadata.track_name}`
            )
            .setURL(currentURL)
            .setDescription(
              `**${mostRecentlyPlayed.listens[0].track_metadata.artist_name}** - *${mostRecentlyPlayed.listens[0].track_metadata?.release_name}*`
            )
            .setAuthor({
              iconURL: interaction.user.displayAvatarURL(),
              name: `Last track for ${brainzUsername}`,
            });
        } else {
          const currentURL =
            mostRecentlyPlayed.listens[0].track_metadata.additional_info
              ?.origin_url;
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
