const axios = require("axios").default;

module.exports = async (listenBrainzToken, brainzUsername) => {
  let response;
  try {
    BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listens`;
    AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };

    // Make request to ListenBrainz
    response = await axios.get(BASE_URL, {
      headers: AUTH_HEADER,
    });
  } catch (error) {
    console.log("Error: " + error);
  }
  return response.data.payload;
};
