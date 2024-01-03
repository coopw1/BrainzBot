const axios = require("axios").default;

module.exports = async (
  artistName,
  releaseName,
  trackName,
  listenBrainzToken
) => {
  try {
    const BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    const AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };
    const PARAMS = {
      params: {
        query: `artist:${artistName} release:${releaseName}  recording:${trackName}`,
        headers: AUTH_HEADER,
      },
    };

    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    MBID = await response.data.recordings[0].id;
    return MBID;
  } catch (error) {
    console.log("Error: " + error);
    return "error";
  }
};
