const {
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const userData = require("../../../../schemas/userData");
const convertSvgToPng = require("../../util/convertSvgToPng");

module.exports = {
  name: "art",
  description: "Get art-creator results from ListenBrainz!",
  category: "Images",
  options: [
    {
      name: "designer-top-5",
      description: "Designer top 5",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timeperiod",
          description: "Time range",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "This Week",
              value: "this_week",
            },
            {
              name: "Last Week",
              value: "week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "Last Month",
              value: "month",
            },
            {
              name: "Last quarter",
              value: "quarter",
            },
            {
              name: "Last Half Year",
              value: "half_year",
            },
            {
              name: "This Year",
              value: "this_year",
            },
            {
              name: "Last Year",
              value: "year",
            },
            {
              name: "All Time",
              value: "all_time",
            },
          ],
        },
      ],
    },
    {
      name: "designer-top-10",
      description: "Designer top 10",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timeperiod",
          description: "Time range",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "This Week",
              value: "this_week",
            },
            {
              name: "Last Week",
              value: "week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "Last Month",
              value: "month",
            },
            {
              name: "Last quarter",
              value: "quarter",
            },
            {
              name: "Last Half Year",
              value: "half_year",
            },
            {
              name: "This Year",
              value: "this_year",
            },
            {
              name: "Last Year",
              value: "year",
            },
            {
              name: "All Time",
              value: "all_time",
            },
          ],
        },
      ],
    },
    {
      name: "lps-on-the-floor",
      description: "LPs on the floor",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "timeperiod",
          description: "Time range",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "This Week",
              value: "this_week",
            },
            {
              name: "Last Week",
              value: "week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "Last Month",
              value: "month",
            },
            {
              name: "Last quarter",
              value: "quarter",
            },
            {
              name: "Last Half Year",
              value: "half_year",
            },
            {
              name: "This Year",
              value: "this_year",
            },
            {
              name: "Last Year",
              value: "year",
            },
            {
              name: "All Time",
              value: "all_time",
            },
          ],
        },
      ],
    },
  ],

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

    let link = `https://api.listenbrainz.org/1/art/${interaction.options.getSubcommand()}/${brainzUsername}/${timeperiod}/750`;
    console.log(link);

    const png = await convertSvgToPng(link);
    const attachment = new AttachmentBuilder(await png, {
      name: "chart.png",
    });

    interaction.editReply({ files: [attachment] });
  },
};
