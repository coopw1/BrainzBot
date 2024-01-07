const axios = require("axios").default;

/**
 * Retrieves the recently played tracks of a user from the ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The authentication token for accessing the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user whose recently played tracks are to be retrieved.
 * @return {promise<Object>} An object of recently played tracks.
 */
module.exports = async (listenBrainzToken, brainzUsername) => {
  try {
    const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listens`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, {
      headers: AUTH_HEADER,
    });

    const recentlyPlayed = response.data.payload;
    return recentlyPlayed;
  } catch (error) {
    console.log("getRecentlyPlayed Error: " + error);
    return "error";
  }
};
