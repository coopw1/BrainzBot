const axios = require("axios").default;

module.exports = async (
  artistName,
  releaseName,
  trackName,
  listenBrainzToken
) => {
  const BASE_URL = `https://api.listenbrainz.org/1/metadata/lookup/`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
  };
  const PARAMS = {
    params: {
      artist_name: artistName,
      release_name: releaseName,
      recording_name: trackName,
    },
    headers: AUTH_HEADER,
  };

  // Make request to MusicBrainz
  const response = await axios.get(BASE_URL, PARAMS).catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    console.log(error.config);
  });

  const songData = await response.data;
  return songData;
};
