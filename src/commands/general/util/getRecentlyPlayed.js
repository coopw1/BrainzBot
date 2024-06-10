const axios = require("axios").default;

const { devEmail } = require("../../../../config.json");

/**
 * Retrieves the recently played tracks of a user from the ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The authentication token for accessing the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user whose recently played tracks are to be retrieved.
 * @return {promise<Object>} An object of recently played tracks.
 */
module.exports = async (listenBrainzToken, brainzUsername) => {
  const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listens`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
  };

  // Make request to ListenBrainz
  const response = await axios
    .get(BASE_URL, {
      headers: AUTH_HEADER,
    })
    .catch(function (error) {
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

  const recentlyPlayed = response.data.payload;
  return recentlyPlayed;
};
