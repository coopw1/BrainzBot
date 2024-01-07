const axios = require("axios").default;

/**
 * Retrieves the currently playing track for a user from ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The token for authenticating with the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user whose currently playing track is to be retrieved.
 * @return {promise<string>} - A promise that resolves to the currently playing track.
 */
module.exports = async (listenBrainzToken, brainzUsername) => {
  try {
    const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/playing-now`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, {
      headers: AUTH_HEADER,
    });

    const currentlyPlaying = response.data.payload;
    return currentlyPlaying;
  } catch (error) {
    console.log("getCurrentlyPlaying Error: " + error);
    return "error";
  }
};
