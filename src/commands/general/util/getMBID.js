const axios = require("axios").default;

module.exports = async (artistName, releaseName, trackName) => {
  let response;
  try {
    BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    PARAMS = {
      params: {
        query: `artist:${artistName} release:${releaseName}  recording:${trackName}`,
      },
    };

    // Make request to MusicBrainz
    response = await axios.get(BASE_URL, PARAMS);
  } catch (error) {
    console.log("Error: " + error);
  }

  MBID = response.data.recordings[0].id;

  return MBID;
};
