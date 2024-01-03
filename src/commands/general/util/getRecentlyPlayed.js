const axios = require("axios").default;

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

    const recentlyPlayed = await response.data.payload;
    return recentlyPlayed;
  } catch (error) {
    console.log("getRecentlyPlayed Error: " + error);
    return "error";
  }
};
