require("dotenv").config();

const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const axios = require("axios").default;

const getCurrentlyPlaying = require("./util/getCurrentlyPlaying");
const getRecentlyPlayed = require("./util/getRecentlyPlayed");
const getAlbumCover = require("./util/getAlbumCover");
const getTotalScrobbles = require("./util/getTotalScrobbles");
const getSongInfo = require("./util/getSongInfo");
const getAuth = require("../util/getAuth");

const { devEmail } = require("../../../config.json");

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
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
  };
  const PARAMS = {
    params: {
      recording_mbids: songMBID,
      recording_msids: songMSID,
    },
    headers: AUTH_HEADER,
  };

  const response = await axios.get(BASE_URL, PARAMS).catch(function (error) {
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
    console.log(error.config);
  });
  const score = response.data.feedback[0].score;
  return score;
}

/**
 * Generates the love buttons based on the given score.
 *
 * @param {number} score - The score to determine the style of the buttons. Possible values are 1, 0, or -1.
 * @return {ActionRowBuilder} The row containing the love and unlove buttons.
 */
function getLoveButtons(score) {
  let loveButton;
  let unloveButton;

  switch (score) {
    case 1:
      loveButton = new ButtonBuilder({
        customId: "love",
        emoji: "❤️",
        style: ButtonStyle.Success,
      });
      unloveButton = new ButtonBuilder({
        customId: "unlove",
        emoji: "💔",
        style: ButtonStyle.Secondary,
      });
      break;
    case 0:
      loveButton = new ButtonBuilder({
        customId: "love",
        emoji: "❤️",
        style: ButtonStyle.Secondary,
      });
      unloveButton = new ButtonBuilder({
        customId: "unlove",
        emoji: "💔",
        style: ButtonStyle.Secondary,
      });
      break;
    case -1:
      loveButton = new ButtonBuilder({
        customId: "love",
        emoji: "❤️",
        style: ButtonStyle.Secondary,
      });
      unloveButton = new ButtonBuilder({
        customId: "unlove",
        emoji: "💔",
        style: ButtonStyle.Success,
      });
      break;
  }
  const row = new ActionRowBuilder({
    components: [loveButton, unloveButton],
  });
  return row;
}

/**
 * Sends feedback for a recording to the ListenBrainz API.
 *
 * @param {number} feedback - The feedback score for the recording - 1 for loved, -1 for unloved.
 * @param {string} listenBrainzToken - The authentication token for accessing the ListenBrainz API.
 * @param {string} MBID - The MusicBrainz ID of the recording.
 * @param {string} MSID - The MessyBrainz ID of the recording.
 */
async function sendFeedback(feedback, listenBrainzToken, MBID, MSID) {
  const BASE_URL = `https://api.listenbrainz.org/1/feedback/recording-feedback`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
  };
  const PARAMS = {
    recording_mbid: MBID,
    recording_msid: MSID,
    score: feedback,
  };
  const HEADERS = {
    headers: AUTH_HEADER,
  };

  await axios.post(BASE_URL, PARAMS, HEADERS).catch(function (error) {
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
    console.log(error.config);
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
    let buttonRow1;
    let MBID;
    let MSID;
    let score;

    const { brainzUsername, listenBrainzToken, tokenIsUsers } = await getAuth(
      interaction
    );
    if (interaction.replied) {
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

    // Check if a track is playing
    if (currentlyPlaying.count) {
      // Track is playing
      // Get Song info
      const songInfo = await getSongInfo(
        currentlyPlaying.listens[0].track_metadata?.artist_name,
        currentlyPlaying.listens[0].track_metadata?.release_name,
        currentlyPlaying.listens[0].track_metadata?.track_name
      );

      // Check if songInfo is a correct match
      const matches =
        (currentlyPlaying.listens[0].track_metadata.artist_name?.includes(
          songInfo.artist_credit_name
        ) ||
          songInfo.artist_credit_name?.includes(
            currentlyPlaying.listens[0].track_metadata.artist_name
          )) &&
        (currentlyPlaying.listens[0].track_metadata.track_name?.includes(
          songInfo.recording_name
        ) ||
          songInfo.recording_name?.includes(
            currentlyPlaying.listens[0].track_metadata.track_name
          ));

      if (songInfo?.recording_name === undefined || !matches) {
        // Song info is empty

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

        // Check if the track has been scrobbled
        const mostRecentSong = await checkRecentForMatch(
          currentlyPlaying,
          listenBrainzToken,
          brainzUsername
        );

        if (mostRecentSong) {
          // Currently playing track has been scrobbled
          MBID = mostRecentSong.mbid_mapping?.recording_mbid;
          MSID = mostRecentSong.additional_info?.recording_msid;
          if (!MSID && !MBID) {
            console.log(mostRecentSong);
          }

          // Check if the track has been loved
          score = await checkIfLoved(
            MBID,
            MSID,
            listenBrainzToken,
            brainzUsername
          );

          buttonRow1 = await getLoveButtons(score);
        }
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

        MBID = songInfo?.recording_mbid;
        MSID = undefined;

        // Check if the track has been loved
        score = await checkIfLoved(
          MBID,
          MSID,
          listenBrainzToken,
          brainzUsername
        );

        if (MBID !== null) {
          buttonRow1 = await getLoveButtons(score);
        }
      }

      // Get total scrobbles
      const totalScrobbles = await getTotalScrobbles(
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
      MSID =
        mostRecentlyPlayed.listens[0].track_metadata.additional_info
          ?.recording_msid;

      // Add track info to embed
      if (MBID) {
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
            ?.origin_url || "";

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
      }

      // Check if the track has been loved
      score = await checkIfLoved(MBID, MSID, listenBrainzToken, brainzUsername);

      buttonRow1 = await getLoveButtons(score);

      // Get time of last scrobble
      const lastScrobble = new Date(mostRecentlyPlayed.latest_listen_ts * 1000);
      // Add time of last scrobble to embed
      embed.setTimestamp(lastScrobble);

      // Get total scrobbles
      const totalScrobbles = await getTotalScrobbles(
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
      const albumCover = await getAlbumCover(MBID);
      // Add thumbnail
      embed.setThumbnail(albumCover);
    }

    // Send embed
    // If there is a button row and the token isn't the default one
    if (
      buttonRow1 &&
      listenBrainzToken !== process.env.LISTENBRAINZ_TOKEN &&
      tokenIsUsers
    ) {
      const message = await interaction.editReply({
        embeds: [embed],
        components: [buttonRow1],
      });

      const buttonCollectorFilter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter: buttonCollectorFilter,
        time: 180_000,
      });

      setTimeout(function () {
        buttonRow1.components[0].setDisabled(true);
        buttonRow1.components[1].setDisabled(true);
        message.edit({ components: [buttonRow1] });
      }, 180_000);

      // Handle the collector
      collector.on("collect", async (buttonInteraction) => {
        // Check if the button was love
        if (buttonInteraction.customId === "love") {
          // User clicked love
          if (score === 1) {
            sendFeedback(0, listenBrainzToken, MBID, MSID);
            buttonRow1.components[0].setStyle(ButtonStyle.Secondary);
            buttonRow1.components[1].setStyle(ButtonStyle.Secondary);
            buttonInteraction.update({ components: [buttonRow1] });
            score = 0;
          } else {
            sendFeedback(1, listenBrainzToken, MBID, MSID);
            buttonRow1.components[0].setStyle(ButtonStyle.Success);
            buttonRow1.components[1].setStyle(ButtonStyle.Secondary);
            buttonInteraction.update({ components: [buttonRow1] });
            score = 1;
          }
        }
        if (buttonInteraction.customId === "unlove") {
          // User clicked unlove
          if (score === -1) {
            sendFeedback(0, listenBrainzToken, MBID, MSID);
            buttonRow1.components[0].setStyle(ButtonStyle.Secondary);
            buttonRow1.components[1].setStyle(ButtonStyle.Secondary);
            buttonInteraction.update({ components: [buttonRow1] });
            score = 0;
          } else {
            sendFeedback(-1, listenBrainzToken, MBID, MSID);
            buttonRow1.components[0].setStyle(ButtonStyle.Secondary);
            buttonRow1.components[1].setStyle(ButtonStyle.Success);
            buttonInteraction.update({ components: [buttonRow1] });
            score = -1;
          }
        }
      });
    } else {
      interaction.editReply({ embeds: [embed] });
    }
  },
};
