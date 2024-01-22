const getTotalScrobbles = require("./getTotalScrobbles");

const axios = require("axios").default;

/**
 * Retrieves the all the tracks of a user from the ListenBrainz API.
 *
 * @param {string} listenBrainzToken - The authentication token for accessing the ListenBrainz API.
 * @param {string} brainzUsername - The username of the user whose recently played tracks are to be retrieved.
 * @return {promise<Object>} An object of recently played tracks.
 */
module.exports = async (
  listenBrainzToken,
  brainzUsername,
  maxCount,
  interaction
) => {
  const totalScrobbles = await getTotalScrobbles(
    listenBrainzToken,
    brainzUsername
  );

  const BASE_URL = `https://api.listenbrainz.org/1/user/${brainzUsername}/listens`;
  const AUTH_HEADER = {
    Authorization: `Token ${listenBrainzToken}`,
    "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
  };

  let PARAMS = {
    headers: AUTH_HEADER,
    params: {
      count: 1000,
      max_ts: 0,
    },
  };

  let responses = {
    count: 0,
    latest_listen_ts: 0,
    listens: [],
    oldest_listen_ts: 0,
    user_id: "",
  };
  let lastResponseCount = 1000;
  while (lastResponseCount === 1000 && responses.count < maxCount) {
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
      return "error";
    });
    const lastResponse = response.data.payload;

    responses.count += lastResponse.count;

    let tempListens = responses.listens;
    responses.listens = tempListens.concat(lastResponse.listens);

    responses.latest_listen_ts = lastResponse.latest_listen_ts;
    responses.oldest_listen_ts = lastResponse.oldest_listen_ts;
    responses.user_id = lastResponse.user_id;

    PARAMS.params.max_ts = lastResponse.listens.slice(-1)[0].listened_at;

    lastResponseCount = response.data.payload.count;

    interaction.editReply({
      content: `Retrieved ${responses.count}/${totalScrobbles} listens. (${
        (responses.count / totalScrobbles) * 100
      }%)`,
    });
  }

  return responses;
};
