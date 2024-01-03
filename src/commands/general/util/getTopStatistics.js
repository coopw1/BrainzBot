const axios = require("axios").default;

async function getTopArtists(listenBrainzToken, brainzUsername, timePeriod) {
  try {
    const BASE_URL = `http://api.listenbrainz.org/1/stats/user/${brainzUsername}/artists`;
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };
    const PARAMS = {
      params: {
        headers: AUTH_HEADER,
        range: timePeriod,
      },
    };

    // Make request to ListenBrainz
    const response = await axios.get(BASE_URL, PARAMS);
    console.log(response.data);
  } catch (error) {
    console.log("getTopArtists Error: " + error);
    return "error";
  }
}

module.exports = { getTopArtists };
