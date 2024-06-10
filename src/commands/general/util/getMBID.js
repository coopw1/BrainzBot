const axios = require("axios").default;

const { devEmail } = require("../../../../config.json");

/**
 * Fetches the MusicBrainz ID of a recording, release, or artist based on the provided parameters.
 *
 * @param {string} artistName - The name of the artist to search for. If not provided, all artists will be considered.
 * @param {string} releaseName - The name of the release to search for. If not provided, all releases will be considered.
 * @param {string} trackName - The name of the track to search for. If not provided, all tracks will be considered.
 * @param {string} MBIDType - The type of MBID to fetch. Must be one of "recordings", "releases", or "artists". Defaults to "recordings".
 * @return {promise<string>} The MusicBrainz ID of the first matching result, or "error" if an error occurred.
 */
module.exports = async (
  artistName,
  releaseName,
  trackName,
  MBIDType = "recordings"
) => {
  const BASE_URL = `http://musicbrainz.org/ws/2/${MBIDType.slice(0, -1)}/`;
  let PARAMS = {
    params: {
      query: ``,
    },
    headers: {
      "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
    },
  };
  if (artistName) {
    PARAMS.params.query = PARAMS.params.query + `artist:${artistName}`;
  }
  if (releaseName) {
    PARAMS.params.query = PARAMS.params.query + `release:${releaseName}`;
  }
  if (trackName) {
    PARAMS.params.query = PARAMS.params.query + `recording:${trackName}`;
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

  const MBID = response.data[MBIDType][0].id;
  return MBID;
};
