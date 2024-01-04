const axios = require("axios").default;

module.exports = async (artistName, releaseName, trackName) => {
  try {
    const BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    const PARAMS = {
      params: {
        query: `artist:${artistName} release:${releaseName}  recording:${trackName}`,
      },
    };

    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    MBID = await response.data.recordings[0].id;
    return MBID;
  } catch (error) {
    console.log("getMBID Error: " + error);
    return "error";
  }
};
