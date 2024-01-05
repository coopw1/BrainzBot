const axios = require("axios").default;

module.exports = async (
  listenBrainzToken,
  brainzUsername,
  searchType,
  timePeriod,
  getListeners = false,
  MBID
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
          count: 100,
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
