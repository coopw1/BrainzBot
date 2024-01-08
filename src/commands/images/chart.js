const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");
const axios = require("axios").default;

const convertSvgToPng = require("../util/convertSvgToPng");
const userData = require("../../../schemas/userData");
const getAuth = require("../util/getAuth");

module.exports = {
  name: "chart",
  description: "Display scrobbles in a nice and neat chart!",
  category: "Images",

  options: [
    {
      name: "user",
      description: "A ListenBrainz username",
      type: ApplicationCommandOptionType.String,
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
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      console.log("replied");
      return;
    }

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

    png = await convertSvgToPng(imageURL);

    const attachment = new AttachmentBuilder(await png, {
      name: "chart.png",
    });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  },
};
