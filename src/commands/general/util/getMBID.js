const axios = require("axios").default;

module.exports = async (
  artistName,
  releaseName,
  trackName,
  MBIDType = "recordings"
) => {
  try {
    const BASE_URL = `http://musicbrainz.org/ws/2/${MBIDType.slice(0, -1)}/`;
    let PARAMS = {
      params: {
        query: ``,
      },
    };
    if (artistName) {
      PARAMS.params.query = PARAMS.params.query + `artist:${artistName}`;
    }
    if (releaseName) {
      PARAMS.params.query = PARAMS.params.query + `release:${releaseName}`;
    }
    if (trackName) {
      PARAMS.params.query = PARAMS.params.query + `recording:${trackName}`;
    }
    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    MBID = await response.data[MBIDType][0].id;
    return MBID;
  } catch (error) {
    console.log("getMBID Error: " + error);
    return "error";
  }
};
