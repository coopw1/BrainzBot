const axios = require("axios").default;

const devEmail = process.env.DEV_EMAIL;

/**
 * Retrieves the URL of the album cover image for a given MusicBrainz recording MBID.
 *
 * @param {string} MBID - The MusicBrainz recording MBID.
 * @return {promise<string>} The URL of the album cover image.
 */
module.exports = async (MBID) => {
  // Get release MBID from Recording MBID

  const BASE_URL = "http://musicbrainz.org/ws/2/recording/";
  const PARAMS = {
    headers: {
      "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
    },
    params: {
      query: `rid:${MBID}`,
    },
  };
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

  const releaseMBID = await response.data.recordings[0]?.releases[0].id;
  return `https://coverartarchive.org/release/${releaseMBID}/front`;
};
