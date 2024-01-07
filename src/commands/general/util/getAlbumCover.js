const axios = require("axios").default;

/**
 * Retrieves the URL of the album cover image for a given MusicBrainz recording MBID.
 *
 * @param {string} MBID - The MusicBrainz recording MBID.
 * @return {promise<string>} The URL of the album cover image.
 */
module.exports = async (MBID) => {
  // Get release MBID from Recording MBID
  try {
    const BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    const PARAMS = {
      params: {
        query: `rid:${MBID}`,
      },
    };
    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    const releaseMBID = await response.data.recordings[0]?.releases[0].id;
    return `https://coverartarchive.org/release/${releaseMBID}/front`;
  } catch (error) {
    console.log("getAlbumCover Error: " + error);
    return "error";
  }
};
