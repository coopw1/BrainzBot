const axios = require("axios").default;

module.exports = async (MBID) => {
  let response;

  // Get release MBID from Recording MBID
  try {
    BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    PARAMS = {
      params: {
        query: `rid:${MBID}`,
      },
    };
    // Make request to MusicBrainz
    response = await axios.get(BASE_URL, PARAMS);
  } catch (error) {
    console.log("Error: " + error);
  }
  releaseMBID = response.data.recordings[0].releases[0].id;

  return `https://coverartarchive.org/release/${releaseMBID}/front`;
};
