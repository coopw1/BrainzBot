const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const getTopStatistics = require("./util/getTopStatistics");
const pagination = require("../util/pagination");
const getMBID = require("./util/getMBID");
const getAuth = require("../util/getAuth");
const stringToUnicode = require("../util/stringToUnicode");

module.exports = {
  name: "top",
  description: "Display top scrobbles!",
  category: "General",
  deleted: false,
  options: [
    {
      name: "listeners",
      description: "Get's the top listeners for the time period",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "artists",
          description: "Shows the top listener's for an artist",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "artist",
              description: "Artist name",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "timeperiod",
              description: "Time period",
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
                  name: "Last half-year",
                  value: "half_yearly",
                },
                {
                  name: "This year",
                  value: "this_year",
                },
                {
                  name: "Last year",
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
          description: "Shows the top listener's for an album",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "album",
              description: "Album name",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "timeperiod",
              description: "Time period",
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                {
                  name: "This Week",
                  value: "this_week",
                },
                {
                  name: "This Month",
                  value: "this_month",
                },
                {
                  name: "This Year",
                  value: "this_year",
                },
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
    },
    {
      name: "artists",
      description: "Show your most listened to artists",
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
          description: "Time period",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "This Week",
              value: "this_week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "This Year",
              value: "this_year",
            },
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
          name: "user",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "artist",
          description: "Filter your top tracks by artist!",
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
              name: "This Week",
              value: "this_week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "This Year",
              value: "this_year",
            },
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
          name: "user",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "artist",
          description: "Filter your top tracks by artist!",
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
              name: "This Week",
              value: "this_week",
            },
            {
              name: "This Month",
              value: "this_month",
            },
            {
              name: "This Year",
              value: "this_year",
            },
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
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

  callback: async (client, interaction) => {
    const noAuthNeeded =
      interaction.options.getSubcommandGroup() === "listeners";

    const { brainzUsername, listenBrainzToken } = await getAuth(
      interaction,
      noAuthNeeded
    );
    if (interaction.replied) {
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

    if (interaction.options.getSubcommandGroup() === "listeners") {
      if (searchType === "releases") {
        searchType = "release-groups";
      }
      const MBID = await getMBID(
        interaction.options.get("artist")?.value || "",
        interaction.options.get("album")?.value || "",
        "",
        searchType
      );
      const topStatistics = await getTopStatistics(
        listenBrainzToken,
        brainzUsername,
        searchType,
        interaction.options.get("timeperiod")?.value || "week",
        true,
        MBID
      );

      let description = "";
      topStatistics.listeners.forEach(async (item, index) => {
        const userName = item.user_name;
        const listenCount = item.listen_count;

        description =
          description +
          `${
            index + 1
          }. [${userName}](https://listenbrainz.org/user/${userName}/) - *${listenCount} listens*\n`;
      });

      // Check if there are no listeners
      if (description === "") {
        const embed = new EmbedBuilder()
          .setDescription(
            `❌ This ${interaction.options
              .getSubcommand()
              .slice(0, -1)} has no listeners!`
          )
          .setColor("ba0000");
        interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
      }
      let embed;
      if (searchType === "release-groups") {
        embed = new EmbedBuilder()
          .setTitle(`Top Listeners for __${topStatistics.release_group_name}__`)
          .setURL(
            `https://listenbrainz.org/album/${topStatistics.release_group_mbid}`
          )
          .setDescription(description)
          .setColor(0x353070);
      } else {
        embed = new EmbedBuilder()
          .setTitle(`Top Listeners for __${topStatistics.artist_name}__`)
          .setURL(
            `https://listenbrainz.org/artist/${topStatistics.artist_mbid}`
          )
          .setDescription(description)
          .setColor(0x353070);
      }

      interaction.reply({ embeds: [embed], ephemeral: false });
      return;
    }

    const count = interaction.options.get("artist") ? 1000 : 100;
    const topStatistics = await getTopStatistics(
      listenBrainzToken,
      brainzUsername,
      searchType,
      interaction.options.get("timeperiod")?.value || "week",
      false,
      null,
      count
    );

    // Check if there are no recently played tracks
    if (topStatistics.count == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `❌ You have no top ${interaction.options.getSubcommand()} stats!`
        )
        .setColor("ba0000");
      interaction.editReply({ embeds: [embed], ephemeral: true });
      return;
    }

    let footer;
    if (interaction.options.get("artist")) {
      topStatistics[searchType] = topStatistics[searchType].filter((item) => {
        return (
          item.artist_name
            .toLowerCase()
            .includes(interaction.options.get("artist").value.toLowerCase()) ||
          item.artist_name
            .toLowerCase()
            .includes(
              stringToUnicode(
                interaction.options.get("artist").value.toLowerCase()
              )
            )
        );
      });
      if (topStatistics[searchType].length === 0) {
        const embed = new EmbedBuilder()
          .setDescription(
            `❌ You have no top listens to ${
              interaction.options.get("artist").value
            }!`
          )
          .setColor("ba0000");
        interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
      }
      footer = ` • ${
        topStatistics[searchType].length
      } results for ${stringToUnicode(
        interaction.options.get("artist").value
      )}`;
    }

    const maxPages = Math.ceil(topStatistics[searchType].length / 10);
    let descriptions = [];

    for (let i = 0; i < maxPages; i++) {
      descriptions[i] = "";
    }

    // Get data for each listen
    topStatistics[searchType].forEach(async (item, index) => {
      let itemName = item[searchType.slice(0, -1).concat("_name")];
      let releaseName;
      let artistName;
      if (searchType === "recordings") {
        itemName = item.track_name;
        releaseName = item?.release_name || "Unknown Artist";
      }
      if (searchType === "releases" || searchType === "recordings") {
        artistName = item?.artist_name || "Unknown Artist";
      }
      const MBID = item[searchType.slice(0, -1).concat("_mbid")];

      const amount = item.listen_count;
      const position = index + 1;

      if (MBID === null) {
        descriptions[Math.floor(index / 10)] =
          descriptions[Math.floor(index / 10)] +
          `${position}. **${itemName}** - *${amount} plays*\n`;
      } else {
        switch (searchType) {
          case "artists":
            descriptions[Math.floor(index / 10)] =
              descriptions[Math.floor(index / 10)] +
              `${position}. **[${itemName}](https://listenbrainz.org/${searchType.slice(
                0,
                -1
              )}/${MBID})** - *${amount} plays*\n`;
            break;
          case "recordings":
            descriptions[Math.floor(index / 10)] =
              descriptions[Math.floor(index / 10)] +
              `${position}. **[${itemName}](https://musicbrainz.org/${searchType.slice(
                0,
                -1
              )}/${MBID} "${itemName}\n  ${artistName} - ${releaseName}")** - *${amount} plays*\n`;
            break;
          case "releases":
            descriptions[Math.floor(index / 10)] =
              descriptions[Math.floor(index / 10)] +
              `${position}. **[${itemName}](https://musicbrainz.org/${searchType.slice(
                0,
                -1
              )}/${MBID} "${artistName} - ${itemName}")** - *${amount} plays*\n`;
            break;
        }
      }
    });

    const timeperiod = interaction.options.get("timeperiod")?.value || "week";
    let baseEmbed;
    switch (timeperiod) {
      case "this_week":
        baseEmbed = {
          title: `Top ${searchType} __This Week__ for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
      case "this_month":
        baseEmbed = {
          title: `Top ${searchType} __This Month__ for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
      case "this_year":
        baseEmbed = {
          title: `Top ${searchType} __This Year__ for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
      case "all_time":
        baseEmbed = {
          title: `Top __All Time__ ${searchType} for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
      case "half_yearly":
        baseEmbed = {
          title: `Top __Half Yearly__ ${searchType} for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
      default:
        baseEmbed = {
          title: `Top __${
            timeperiod[0].toUpperCase() + timeperiod.substring(1)
          }ly__ ${searchType} for ${brainzUsername}`,
          color: 0x353070,
        };
        break;
    }

    let embeds = [];

    for (let i = 0; i < maxPages; i++) {
      embeds[i] = new EmbedBuilder(baseEmbed).setDescription(
        await descriptions[i]
      );
    }

    pagination(interaction, embeds, maxPages, footer);
  },
};
