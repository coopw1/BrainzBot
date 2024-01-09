require("dotenv").config();

const { ApplicationCommandOptionType } = require("discord.js");
const getAuth = require("../util/getAuth");
const getTopStatistics = require("./util/getTopStatistics");
const axios = require("axios").default;

module.exports = {
  name: "judge",
  description: "Judges your music taste using AI",
  category: "General",
  options: [
    {
      name: "user",
      description: "A ListenBrainz username",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      return;
    }

    const LBresponse = await getTopStatistics(
      listenBrainzToken,
      brainzUsername,
      "artists",
      "week"
    ).catch(function (error) {
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

    const BASE_URL = "https://api.wit.ai/message";
    const AUTH_HEADER = {
      Authorization: `Bearer ${process.env.WIT_TOKEN}`,
    };
    const MESSAGE = "Hi there! What is your name.";
    const PARAMS = {
      headers: AUTH_HEADER,
      params: {
        q: MESSAGE,
        // entities: LBresponse,
      },
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
    });

    interaction.editReply({ content: response.data.toString() });
    console.log("🚀 ~ callback: ~ response.data:", response);
  },
};
