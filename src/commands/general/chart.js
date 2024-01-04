const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");
const axios = require("axios").default;
const canvas = require("@napi-rs/canvas");

const userData = require("../../../schemas/userData");

module.exports = {
  name: "chart",
  description: "Display scrobbles in a nice and neat chart!",
  category: "General",

  options: [
    {
      name: "user",
      description: "user",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "timeperiod",
      description: "Time period",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: "Week",
          value: "week",
        },
        {
          name: "Month",
          value: "month",
        },
        {
          name: "Half-year",
          value: "half_yearly",
        },
        {
          name: "Year",
          value: "year",
        },
        {
          name: "All Time",
          value: "all_time",
        },
      ],
    },
    {
      name: "dimension",
      description: "Dimension",
      type: ApplicationCommandOptionType.Integer,
      required: false,
      choices: [
        {
          name: "2x2",
          value: 2,
        },
        {
          name: "3x3",
          value: 3,
        },
        {
          name: "4x4",
          value: 4,
        },
        {
          name: "5x5",
          value: 5,
        },
      ],
    },
  ],
  // deleted: Boolean,
  callback: async (client, interaction) => {
    // Get user data from database
    let currentUserData;
    if (
      interaction.options.get("user") &&
      !(interaction.options.get("user").value === interaction.user.id)
    ) {
      currentUserData = await userData.findOne({
        userID: interaction.options.get("user").value,
      });
      if (currentUserData === null) {
        const embed = new EmbedBuilder()
          .setDescription(
            "❌ This user has not linked their ListenBrainz account yet!\n" +
              "Use the </login:1190736297770352801> command to link your ListenBrainz account."
          )
          .setColor("ba0000");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
    } else {
      currentUserData = await userData.findOne({
        userID: interaction.user.id,
      });
      if (currentUserData === null) {
        const embed = new EmbedBuilder()
          .setDescription(
            "❌ You have not linked your ListenBrainz account yet!\n" +
              "Use the </login:1190736297770352801> command to link your ListenBrainz account."
          )
          .setColor("ba0000");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
    }
    await interaction.deferReply();

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;

    const timeperiod = interaction.options.get("timeperiod")?.value || "week";
    const dimension = interaction.options.get("dimension")?.value || 3;

    // Create base embed
    const embed = new EmbedBuilder({
      color: 0x353070,
    });
    if (timeperiod === "all_time") {
      embed.setTitle(
        `${dimension}x${dimension} All Time chart for ${brainzUsername}`
      );
    } else if (timeperiod === "half_yearly") {
      embed.setTitle(
        `${dimension}x${dimension} Half Yearly chart for ${brainzUsername}`
      );
    } else {
      embed.setTitle(
        `${dimension}x${dimension} ${
          timeperiod[0].toUpperCase() + timeperiod.substring(1)
        }ly chart for ${brainzUsername}`
      );
    }

    // Send back image of chart
    const imageURL = `https://api.listenbrainz.org/1/art/grid-stats/${brainzUsername}/${timeperiod}/${dimension}/0/1024`;

    // Get SVG data
    let svgData = (await axios.get(imageURL, { responseType: "text" })).data;
    const buffer = await svgData;

    const regex = /xlink:href="(.*?)"/g;
    const matches = [...buffer.matchAll(regex)];

    const imageLinks = matches.map((match) => match[1]);

    const myCanvas = canvas.createCanvas(1024, 1024);
    const context = myCanvas.getContext("2d");

    let counter = 0;
    imageLinks.forEach(async (imageLink, index) => {
      const response = await axios.get(imageLink, {
        responseType: "arraybuffer",
      });

      const image = await canvas.loadImage(response.data);

      const position = [];
      position[0] = index % dimension;
      position[1] = Math.floor(index / dimension);

      context.drawImage(
        image,
        (position[0] * 1024) / dimension,
        (position[1] * 1024) / dimension,
        1024 / dimension,
        1024 / dimension
      );

      counter++;
      if (counter === imageLinks.length) {
        const attachment = new AttachmentBuilder(await myCanvas.encode("png"), {
          name: "chart.png",
        });
        interaction.editReply({
          embeds: [embed],
          files: [attachment],
        });
      }
    });
  },
};
