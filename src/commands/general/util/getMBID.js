const axios = require("axios").default;

module.exports = async (
  artistName,
  releaseName,
  trackName,
  listenBrainzToken
) => {
  let response;
  try {
    BASE_URL = "http://musicbrainz.org/ws/2/recording/";
    AUTH_HEADER = {
      Authorization: `Token ${listenBrainzToken}`,
    };
    PARAMS = {
      params: {
        query: `artist:${artistName} release:${releaseName}  recording:${trackName}`,
        headers: AUTH_HEADER,
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
