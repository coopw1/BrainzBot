const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const getTopStatistics = require("./util/getTopStatistics");
const userData = require("../../../schemas/userData");
const pagination = require("../util/pagination");
const getMBID = require("./util/getMBID");

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
          description: "Show your most listened to artists",
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
        userName = item.user_name;
        listenCount = item.listen_count;

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
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      console.log(topStatistics);
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

    const topStatistics = await getTopStatistics(
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
      let name = item[searchType.slice(0, -1).concat("_name")];
      if (searchType === "recordings") {
        artistName = item.track_name;
      }
      const MBID = item[searchType.slice(0, -1).concat("_mbid")];
      const amount = item.listen_count;
      const position = index + 1;

      if (MBID === null) {
        descriptions[Math.floor(index / 10)] =
          descriptions[Math.floor(index / 10)] +
          `${position}. **${artistName}** - *${amount} plays*\n`;
      } else {
        if (searchType === "artists") {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `${position}. **[${artistName}](https://listenbrainz.org/${searchType.slice(
              0,
              -1
            )}/${MBID})** - *${amount} plays*\n`;
        } else {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `${position}. **[${artistName}](https://musicbrainz.org/${searchType.slice(
              0,
              -1
            )}/${MBID})** - *${amount} plays*\n`;
        }
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

    let embeds = [];

    for (let i = 0; i < maxPages; i++) {
      embeds[i] = new EmbedBuilder(baseEmbed).setDescription(
        await descriptions[i]
      );
    }

    pagination(interaction, embeds, maxPages);
  },
};
