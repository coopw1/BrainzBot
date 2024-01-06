const axios = require("axios").default;

/**
 * Fetches the total number of scrobbles for a given user from ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The authorization token for accessing the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user for whom the scrobbles are fetched.
 * @return {promise<number>} The total number of scrobbles for the user.
 */
module.exports = async (listenBrainzToken, brainzUsername) => {
  try {
    const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listen-count`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, {
      headers: AUTH_HEADER,
    });

    const totalScrobbles = await response.data.payload.count;
    return totalScrobbles;
  } catch (error) {
    console.log("getTotalScrobbles Error: " + error);
  }
};
