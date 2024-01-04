const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const getTopStatistics = require("./util/getTopStatistics");
const userData = require("../../../schemas/userData");
const pagination = require("../util/pagination");

module.exports = {
  name: "top",
  description: "Display top scrobbles!",
  category: "General",
  options: [
    {
      name: "artists",
      description: "Show your most listened to artists",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
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
      ],
    },
    {
      name: "albums",
      description: "Show your most listened to albums",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
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
      ],
    },
    {
      name: "tracks",
      description: "Show your most listened to tracks",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
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
      ],
    },
  ],

  callback: async (client, interaction) => {
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
      return;
    }

    let searchType;
    switch (interaction.options.getSubcommand()) {
      case "artists":
        searchType = "artists";
        break;
      case "albums":
        searchType = "releases";
        break;
      case "tracks":
        searchType = "recordings";
        break;
    }

    const brainzUsername = currentUserData.ListenBrainzUsername;
    const listenBrainzToken = currentUserData.ListenBrainzToken;
    topStatistics = await getTopStatistics(
      listenBrainzToken,
      brainzUsername,
      searchType,
      interaction.options.get("timeperiod")?.value || "week"
    );

    // Check if there are no recently played tracks
    if (topStatistics.count == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `❌ You have no top ${interaction.options.getSubcommand()} stats!`
        )
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const maxPages = Math.ceil(topStatistics.count / 10);
    let descriptions = [];

    for (let i = 0; i < maxPages; i++) {
      descriptions[i] = "";
    }

    // Get data for each listen
    topStatistics[searchType].forEach(async (item, index) => {
      const artistName = item[searchType.slice(0, -1).concat("_name")];
      const MBID = item[searchType.slice(0, -1).concat("_mbid")];
      const amount = item.listen_count;
      const position = index + 1;

      if (MBID === undefined) {
        descriptions[Math.floor(index / 10)] =
          descriptions[Math.floor(index / 10)] +
          `${position}. **${artistName}** - *${amount} plays*\n`;
      } else {
        descriptions[Math.floor(index / 10)] =
          descriptions[Math.floor(index / 10)] +
          `${position}. **[${artistName}](https://musicbrainz.org/${searchType.slice(
            0,
            -1
          )}/${MBID})** - *${amount} plays*\n`;
      }
    });

    const timeperiod = interaction.options.get("timeperiod")?.value || "week";
    let baseEmbed;
    if (timeperiod === "all_time") {
      baseEmbed = {
        title: `Top All Time ${searchType} for ${interaction.user.username}`,
        color: 0x353070,
      };
    } else if (timeperiod === "half_yearly") {
      baseEmbed = {
        title: `Top Half Yearly ${searchType} for ${interaction.user.username}`,
        color: 0x353070,
      };
    } else {
      baseEmbed = {
        title: `Top ${
          timeperiod[0].toUpperCase() + timeperiod.substring(1)
        }ly ${searchType} for ${interaction.user.username}`,
        color: 0x353070,
      };
    }

    //Create embed for each page, 5 listens each
    let recent1to10Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[0]
    );
    let recent11to20Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[1]
    );
    let recent21to30Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[2]
    );
    let recent31to40Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[3]
    );
    let recent41to50Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[4]
    );
    let recent51to60Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[5]
    );
    let recent61to70Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[6]
    );
    let recent71to80Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[7]
    );
    let recent81to90Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[8]
    );
    let recent91to100Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[9]
    );

    const embeds = [
      recent1to10Embed,
      recent11to20Embed,
      recent21to30Embed,
      recent31to40Embed,
      recent41to50Embed,
      recent51to60Embed,
      recent61to70Embed,
      recent71to80Embed,
      recent81to90Embed,
      recent91to100Embed,
    ];

    pagination(interaction, embeds, maxPages);
  },
};
