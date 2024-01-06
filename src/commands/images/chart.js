const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");
const axios = require("axios").default;
const canvas = require("@napi-rs/canvas");

const convertSvgToPng = require("../util/convertSvgToPng");
const userData = require("../../../schemas/userData");

module.exports = {
  name: "chart",
  description: "Display scrobbles in a nice and neat chart!",
  category: "Images",

  options: [
    {
      name: "user",
      description: "user",
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
    // Get user data from database
    const currentUserData = await userData.findOne({
      userID: interaction.user.id,
    });

    // Check if username is provided through command or DB
    if (currentUserData === null && !interaction.options.get("username")) {
      // No username provided
      const embed = new EmbedBuilder()
        .setDescription(
          "❌ You must link your ListenBrainz account to use this command without specifying a username!\n" +
            "Use the </login:1190736297770352801> command to link your ListenBrainz account."
        )
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (interaction.options.get("username")) {
      // Username provided

      // Make sure that user exists
      const BASE_URL = `https://api.listenbrainz.org/1/search/users/`;
      const AUTH_HEADER = {
        Authorization: `Token ${process.env.LISTENBRAINZ_TOKEN}`,
      };

      const PARAMS = {
        params: {
          search_term: interaction.options.get("username").value,
        },
        headers: AUTH_HEADER,
      };

      const response = await axios.get(BASE_URL, PARAMS);

      const userResponse = response.data.users[0].user_name;
      if (!(userResponse === interaction.options.get("username").value)) {
        // User doesn't exist
        const embed = new EmbedBuilder()
          .setDescription(
            `❌ User ${
              interaction.options.get("username").value
            } doesn't exist.`
          )
          .setColor("ba0000");
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
    }
    await interaction.deferReply();

    let brainzUsername;
    // Check if username is provided through command
    if (interaction.options.get("username")) {
      // Get username from command
      brainzUsername = interaction.options.get("username").value;
    } else {
      // Get username from DB
      brainzUsername = currentUserData.ListenBrainzUsername;
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
