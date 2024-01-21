const axios = require("axios").default;

/**
 * Asynchronous function to check if a user has voted for the bot on top.gg API.
 *
 * @param {Object} interaction - The interaction object containing user information.
 * @return {boolean} The voted status of the user.
 */
module.exports = async (interaction) => {
  const BASE_URL = "https://top.gg/api/bots/1191438412159389806/check";
  const AUTH_HEADER = {
    Authorization: process.env.TOPGG_TOKEN,
  };
  const PARAMS = {
    params: {
      userId: interaction.user.id,
    },
    headers: AUTH_HEADER,
  };

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
  const votedStatus = Boolean(response.data.voted);

  return votedStatus;
};
