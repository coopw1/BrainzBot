const axios = require("axios").default;
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

module.exports = {
  name: "vote",
  description: "Vote for the bot!!",
  category: "Misc",

  callback: async (client, interaction) => {
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
    const votedStatus = response.data.voted;

    if (votedStatus === 1) {
      const embed = new EmbedBuilder({
        title: "You have already voted!",
        description: "You can only vote once every 12 hours.",
        footer: {
          text: "Thanks for being cool, this helps more people find ListenBrainz!",
        },
        color: 0x353070,
      });

      const button = new ButtonBuilder({
        label: "Vote!",
        url: "https://top.gg/bot/1191438412159389806/vote",
        style: ButtonStyle.Link,
      });
      const row = new ActionRowBuilder({
        components: [button],
      });

      interaction.reply({ embeds: [embed], components: [row] });
    } else {
      const embed = new EmbedBuilder({
        title: "Click the button below to vote!",
        footer: {
          text: "Thanks for being cool, this helps more people find ListenBrainz!",
        },
        color: 0x353070,
      });

      const button = new ButtonBuilder({
        label: "Vote!",
        url: "https://top.gg/bot/1191438412159389806/vote",
        style: ButtonStyle.Link,
      });
      const row = new ActionRowBuilder({
        components: [button],
      });

      interaction.reply({ embeds: [embed], components: [row] });
    }
  },
};
