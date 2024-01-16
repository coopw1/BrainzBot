const axios = require("axios").default;

/**
 * Retrieves the currently playing track for a user from ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The token for authenticating with the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user whose currently playing track is to be retrieved.
 * @return {promise<string>} - A promise that resolves to the currently playing track.
 */
module.exports = async (listenBrainzToken, brainzUsername) => {
  const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/playing-now`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
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

  const currentlyPlaying = response.data.payload;
  return currentlyPlaying;
};
