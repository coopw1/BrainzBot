const axios = require("axios").default;

module.exports = async (
  listenBrainzToken,
  brainzUsername,
  searchType,
  timePeriod
) => {
  try {
    const BASE_URL = `http://api.listenbrainz.org/1/stats/user/${brainzUsername}/${searchType}`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };
    const PARAMS = {
      params: {
        headers: AUTH_HEADER,
        range: timePeriod,
        count: 100,
      },
      headers: AUTH_HEADER,
    };

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    const topStatistics = response.data.payload;
    return topStatistics;
  } catch (error) {
    console.log("getTopArtists Error: " + error);
    return "error";
  }
};
