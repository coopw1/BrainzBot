const axios = require("axios").default;

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
    console.log("Error: " + error);
  }
};
