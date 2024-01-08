const {
  EmbedBuilder,
  time,
  ApplicationCommandOptionType,
} = require("discord.js");

const userData = require("../../../schemas/userData");
const getRecentlyPlayed = require("./util/getRecentlyPlayed");
const getTotalScrobbles = require("./util/getTotalScrobbles");
const pagination = require("../util/pagination");
const getAuth = require("../util/getAuth");

module.exports = {
  name: "recent",
  description: "Get your recent listens",
  category: "General",
  options: [
    {
      name: "user",
      description: "A ListenBrainz username",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  callback: async (client, interaction) => {
    const { brainzUsername, listenBrainzToken } = await getAuth(interaction);
    if (interaction.replied) {
      return;
    }

    let descriptions = ["", "", "", "", ""];

    // Get recently played tracks from ListenBrainz API
    const recentlyPlayed = await getRecentlyPlayed(
      listenBrainzToken,
      brainzUsername
    );

    // Check if there are no recently played tracks
    if (recentlyPlayed.count === 0) {
      const embed = new EmbedBuilder()
        .setDescription("❌ You have no recent listens!")
        .setColor("ba0000");
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const maxPages = Math.ceil(recentlyPlayed.count / 5);

    // Get data for each listen
    recentlyPlayed.listens.forEach(async (listen, index) => {
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
          descriptions[Math.floor(index / 5)] =
            descriptions[Math.floor(index / 5)] +
            `__**${trackName}**__  by **${artistName}**\n` +
            `${time(timestamp, "t")} • *${releaseName}*\n\n`;
        } else {
          descriptions[Math.floor(index / 5)] =
            descriptions[Math.floor(index / 5)] +
            `**[${trackName}](${listen.track_metadata.additional_info.origin_url})** by **${artistName}**\n` +
            `${time(timestamp, "t")} • *${releaseName}*\n\n`;
        }
      } else {
        // Has MBID
        if (listen.track_metadata.additional_info.origin_url === undefined) {
          descriptions[Math.floor(index / 5)] =
            descriptions[Math.floor(index / 5)] +
            `**${trackName}** by **${artistName}** [(MB)](https://musicbrainz.org/recording/${MBID}/)\n` +
            `${time(timestamp, "t")} • *${releaseName}*\n\n`;
        } else {
          descriptions[Math.floor(index / 5)] =
            descriptions[Math.floor(index / 5)] +
            `**[${trackName}](${listen.track_metadata.additional_info.origin_url})** by **${artistName}** [(MB)](https://musicbrainz.org/recording/${MBID}/)\n` +
            `${time(timestamp, "t")} • *${releaseName}*\n\n`;
        }
      }
    });

    // Get total scrobbles
    totalScrobbles = await getTotalScrobbles(listenBrainzToken, brainzUsername);
    // Create base embed
    const baseEmbed = {
      title: `Lastest tracks for ${interaction.user.username}`,
      color: 0x353070,
    };

    //Create embed for each page, 5 listens each
    let recent1to5Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[0]
    );
    let recent6to10Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[1]
    );
    let recent11to15Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[2]
    );
    let recent16to20Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[3]
    );
    let recent21to25Embed = new EmbedBuilder(baseEmbed).setDescription(
      await descriptions[4]
    );

    // Create list of embeds
    const embeds = [
      recent1to5Embed,
      recent6to10Embed,
      recent11to15Embed,
      recent16to20Embed,
      recent21to25Embed,
    ];

    pagination(
      interaction,
      embeds,
      maxPages,
      ` - ${interaction.user.username} has ${totalScrobbles} scrobbles`
    );
  },
};
