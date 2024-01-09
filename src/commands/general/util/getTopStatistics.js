const axios = require("axios").default;

/**
 * Retrieves top statistics from the ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The token for authenticating with the ListenBrainz API.
 * @param {string} brainzUsername - The username for retrieving user-specific statistics.
 * @param {string} searchType - The type of statistics to retrieve.
 * @param {string} timePeriod - The time period for which to retrieve statistics.
 * @param {boolean} [getListeners=false] - Optional parameter to retrieve listeners for a specific MBID.
 * @param {string} [MBID] - Optional parameter for the MBID of an artist or release.
 * @param {number} [count=100] - Optional parameter for the number of top statistics to retrieve.
 * @return {Promise<Object>} A promise that resolves to the top statistics retrieved from the ListenBrainz API.
 */
module.exports = async (
  listenBrainzToken,
  brainzUsername,
  searchType,
  timePeriod,
  getListeners = false,
  MBID,
  count = 100
) => {
  try {
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };

    let BASE_URL;
    let PARAMS;
    if (getListeners) {
      BASE_URL = `http://api.listenbrainz.org/1/stats/${searchType.slice(
        0,
        -1
      )}/${MBID}/listeners`;
      PARAMS = {
        headers: AUTH_HEADER,
      };
    }
    if (!getListeners) {
      BASE_URL = `http://api.listenbrainz.org/1/stats/user/${brainzUsername}/${searchType}`;
      PARAMS = {
        params: {
          range: timePeriod,
          count: count,
        },
        headers: AUTH_HEADER,
      };
    }

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    const topStatistics = response.data.payload;
    return topStatistics;
  } catch (error) {
    console.log("getTopArtists Error: " + error);
    return "error";
  }
};
