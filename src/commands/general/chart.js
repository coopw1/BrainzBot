const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");
const axios = require("axios").default;
const canvas = require("@napi-rs/canvas");

const userData = require("../../../schemas/userData");

module.exports = {
  name: "chart",
  description: "Display scrobbles in a nice and neat chart!",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "timeperiod",
      description: "Time period",
      type: ApplicationCommandOptionType.String,
      required: true,
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
          name: "Half Year",
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
      required: true,
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
    await interaction.deferReply();
    // Get user data from database
    const currentUserData = await userData.findOne({
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
    }

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;

    const timeperiod = interaction.options.get("timeperiod").value;
    const dimension = interaction.options.get("dimension").value;

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
          content: "Here's your chart!",
          files: [attachment],
        });
      }
    });
  },
};
