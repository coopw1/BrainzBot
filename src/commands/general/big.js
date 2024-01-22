const getAuth = require("../util/getAuth");
const pagination = require("../util/pagination");
const getAllListens = require("./util/getAllListens");

require("dotenv").config();

const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  time,
} = require("discord.js");

module.exports = {
  name: "big",
  description: "Big",
  category: "General",
  options: [
    {
      name: "listens",
      description: "Get ALL of your listens!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "A ListenBrainz username",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "count",
          description: "Max number of listens to get! Caps at 5000 by default.",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
      ],
    },
  ],

  callback: async (client, interaction) => {
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      return;
    }
    if (listenBrainzToken === process.env.LISTENBRAINZ_TOKEN) {
      const embed = new EmbedBuilder({
        description:
          "❌ You must link your ListenBrainz account to use this command!\n" +
          "Use the </login:1190736297770352801> command to link your ListenBrainz account.",
        color: 0xba0000,
      });
      interaction.editReply({ embeds: [embed] });
      return;
    }

    const maxListens = interaction.options.get("count")
      ? interaction.options.get("count").value
      : 5000;

    const allListens = await getAllListens(
      listenBrainzToken,
      brainzUsername,
      maxListens,
      interaction
    );

    const maxPages = Math.ceil(allListens.count / 10);

    let descriptions = [];

    for (let i = 0; i < maxPages; i++) {
      descriptions[i] = "";
    }

    allListens.listens.forEach((listen, index) => {
      // Extract relevant information from the listen object
      const artistName = listen.track_metadata.artist_name;
      const releaseName = listen.track_metadata?.release_name;
      const trackName = listen.track_metadata.track_name;
      const timestamp = new Date(listen.listened_at * 1000);
      const MBID = listen.track_metadata?.mbid_mapping?.recording_mbid;

      // Add the data to their corresponding embed
      if (MBID === undefined) {
        // No MBID
        if (listen.track_metadata.additional_info.origin_url === undefined) {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `__**${trackName}**__  by **${artistName}**\n` +
            `${time(timestamp, "f")} • *${releaseName}*\n\n`;
        } else {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `**[${trackName}](${listen.track_metadata.additional_info.origin_url})** by **${artistName}**\n` +
            `${time(timestamp, "f")} • *${releaseName}*\n\n`;
        }
      } else {
        // Has MBID
        if (listen.track_metadata.additional_info.origin_url === undefined) {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `**${trackName}** by **${artistName}** [(MB)](https://musicbrainz.org/recording/${MBID}/)\n` +
            `${time(timestamp, "f")} • *${releaseName}*\n\n`;
        } else {
          descriptions[Math.floor(index / 10)] =
            descriptions[Math.floor(index / 10)] +
            `**[${trackName}](${listen.track_metadata.additional_info.origin_url})** by **${artistName}** [(MB)](https://musicbrainz.org/recording/${MBID}/)\n` +
            `${time(timestamp, "f")} • *${releaseName}*\n\n`;
        }
      }
    });

    let baseEmbed = {
      title: `Full listen history for ${brainzUsername}`,
      color: 0x353070,
    };

    let embeds = [];
    for (let i = 0; i < maxPages; i++) {
      if (descriptions[i].length > 4096) {
        embeds.push(
          new EmbedBuilder(baseEmbed)
            .setDescription(descriptions[i].slice(0, 4096))
            .addFields({ name: "Overflow", value: descriptions[i].slice(4096) })
        );
      } else {
        embeds.push(
          new EmbedBuilder(baseEmbed).setDescription(descriptions[i])
        );
      }
    }

    pagination(
      interaction,
      embeds,
      maxPages,
      ` - ${brainzUsername} has ${allListens.count} scrobbles`
    );
  },
};
