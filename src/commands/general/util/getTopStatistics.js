const axios = require("axios").default;

const devEmail = process.env.DEV_EMAIL;

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
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
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

  const topStatistics = response.data.payload;
  return topStatistics;
};
