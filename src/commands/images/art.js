const {
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const getAuth = require("../util/getAuth");
const convertSvgToPngImage = require("../util/convertSvgToPngImage");
const convertSvgToPngText = require("../util/convertSvgToPngText");

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
          name: "user",
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
          name: "user",
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
          name: "user",
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
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

  callback: async (client, interaction) => {
    const { brainzUsername } = await getAuth(interaction);
    if (interaction.replied) {
      return;
    }

    const timeperiod = interaction.options.get("timeperiod")?.value || "week";

    let link = `https://api.listenbrainz.org/1/art/${interaction.options.getSubcommand()}/${brainzUsername}/${timeperiod}/750`;

    let png;
    if (interaction.options.getSubcommand() === "lps-on-the-floor") {
      png = await convertSvgToPngImage(link);
    } else {
      png = await convertSvgToPngText(link);
    }
    const attachment = new AttachmentBuilder(await png, {
      name: "chart.png",
    });

    interaction.editReply({ files: [attachment] });
  },
};
