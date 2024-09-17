const axios = require("axios").default;

const { devEmail } = require("../../../../config.json");

/**
 * Retrieves song metadata from the ListenBrainz API based on the provided artist, release, and track names.
 *
 * @param {string} artistName - The name of the artist.
 * @param {string} releaseName - The name of the release.
 * @param {string} trackName - The name of the track.
 * @param {string} listenBrainzToken - The ListenBrainz API token for authentication.
 * @return {promise<Object>} A promise that resolves to the song metadata retrieved from the ListenBrainz API.
 */
module.exports = async (
  artistName,
  releaseName,
  trackName,
  listenBrainzToken
) => {
  const BASE_URL = `https://api.listenbrainz.org/1/metadata/lookup/`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
  };

  let PARAMS;
  // Make sure the artist, release, and track are under 250 characters combined
  if (artistName.length + releaseName.length + trackName.length > 250) {
    PARAMS = {
      params: {
        artist_name: artistName,
        recording_name: trackName,
        metadata: true,
        inc: "release_group",
      },
      headers: AUTH_HEADER,
    };
  } else {
    PARAMS = {
      params: {
        artist_name: artistName,
        release_name: releaseName,
        recording_name: trackName,
        metadata: true,
        inc: "release",
      },
      headers: AUTH_HEADER,
    };
  }

  // Make request to MusicBrainz
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
    return "error";
  });

  const songData = response.data;
  return songData;
};
