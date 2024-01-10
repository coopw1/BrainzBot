const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const axios = require("axios").default;

module.exports = {
  name: "search",
  description: "Search for a song, artist or album",
  category: "Tools",
  options: [
    {
      name: "song",
      description: "Search for a song",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "recording",
          description: "(part of) the recording's name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "artist",
          description: "(part of) the combined credited artist's name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "country",
          description: "the 2-letter country code for the artist",
          type: ApplicationCommandOptionType.String,
          required: false,
          minLength: 2,
          maxLength: 2,
        },
        {
          name: "position",
          description: "the position of the song in the album",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
        {
          name: "release",
          description: "the name of the track this song was released under",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "artist",
      description: "Search for a artist",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "artist",
          description: "(part of) the artist's name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "country",
          description: "the 2-letter country code for the artist",
          type: ApplicationCommandOptionType.String,
          required: false,
          minLength: 2,
          maxLength: 2,
        },
        {
          name: "alive",
          description: "whether the artist is alive",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "gender",
          description: "the artist's gender",
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "Male",
              value: "male",
            },
            {
              name: "Female",
              value: "female",
            },
            {
              name: "Other",
              value: "other",
            },
            {
              name: "Not Applicable",
              value: "not applicable",
            },
          ],
        },
        {
          name: "type",
          description: "the artist's type (“person”, “group”, etc.)",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "Person",
              value: "person",
            },
            {
              name: "Group",
              value: "group",
            },
            {
              name: "Choir",
              value: "choir",
            },
            {
              name: "Character",
              value: "character",
            },
            {
              name: "Other",
              value: "other",
            },
          ],
        },
      ],
    },
    {
      name: "album",
      description: "Search for an album",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "release-group",
          description: "the name of the album",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "artist",
          description: "(part of) the combined credited artist's name",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "country",
          description: "the 2-letter code country for the album",
          type: ApplicationCommandOptionType.String,
          required: false,
          minLength: 2,
          maxLength: 2,
        },
        {
          name: "lang",
          description: "the 3-letter language code for the album",
          type: ApplicationCommandOptionType.String,
          required: false,
          minLength: 3,
          maxLength: 3,
        },
        {
          name: "tracks",
          description: "the total number of tracks on the album",
          type: ApplicationCommandOptionType.Integer,
          required: false,
        },
      ],
    },
  ],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    // Get the subcommand
    const subcommand = interaction.options.getSubcommand();

    // Turn the subcommand options into an object
    let options = {};
    switch (subcommand) {
      case "song":
        if (interaction.options.get("recording")) {
          options.recording = interaction.options.getString("recording");
        }
        if (interaction.options.getString("artist")) {
          options.artist = interaction.options.getString("artist");
        }
        if (interaction.options.getString("country")) {
          options.country = interaction.options.getString("country");
        }
        if (interaction.options.getInteger("position")) {
          options.position = interaction.options.getInteger("position");
        }
        if (interaction.options.getString("release")) {
          options.release = interaction.options.getString("release");
        }
        break;

      case "artist":
        if (interaction.options.getString("artist")) {
          options.artist = interaction.options.getString("artist");
        }
        if (interaction.options.getString("country")) {
          options.country = interaction.options.getString("country");
        }
        if (interaction.options.getBoolean("alive")) {
          options.alive = interaction.options.getBoolean("alive");
        }
        if (interaction.options.getString("gender")) {
          options.gender = interaction.options.getString("gender");
        }
        if (interaction.options.getString("type")) {
          options.type = interaction.options.getString("type");
        }
        break;

      case "album":
        if (interaction.options.getString("release-group")) {
          options["release-group"] =
            interaction.options.getString("release-group");
        }
        if (interaction.options.getString("artist")) {
          options.artist = interaction.options.getString("artist");
        }
        if (interaction.options.getString("country")) {
          options.country = interaction.options.getString("country");
        }
        if (interaction.options.getString("lang")) {
          options.lang = interaction.options.getString("lang");
        }
        if (interaction.options.getInteger("tracks")) {
          options.tracks = interaction.options.getInteger("tracks");
        }
        break;
    }

    let query = "";
    Object.entries(options).forEach((entry) => {
      query = `${query}${entry[0]}:${entry[1]} `;
    });
    if (query === "") {
      const embed = new EmbedBuilder({
        title: "Search results",
        description: "You must provide at least one search term.",
        color: 0x353070,
      });
      interaction.editReply({ embeds: [embed] });
      return;
    }

    let searchType;
    switch (interaction.options.getSubcommand()) {
      case "artist":
        searchType = "artists";
        break;
      case "album":
        searchType = "release-groups";
        break;
      case "song":
        searchType = "recordings";
        break;
    }

    const BASE_URL = `http://musicbrainz.org/ws/2/${searchType.slice(0, -1)}/`;
    const PARAMS = {
      params: {
        query: query.slice(0, -1),
      },
      headers: {
        "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
      },
    };

    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    const items = await response.data[searchType];
    let maxPages = items.length;

    // Create list of all 25 items
    let embeds = [];
    let MBIDS = [];

    items.forEach((item, index) => {
      let MBID;
      let artistName;
      let artistType;
      let artistArea;
      let artistDisambiguation;
      let artistBegin;
      let artistEnd;
      let artistTags;
      let releaseName;
      let artist;
      let artistMBID;
      let recordingName;
      let releaseMBID;
      let releaseDate;

      switch (searchType) {
        case "artists":
          MBID = item.id;
          artistName = item?.name || "No name";
          artistType = item.type || "Unknown";
          artistArea = item.area?.name || "Unknown";
          artistDisambiguation = item.disambiguation || "None";
          artistBegin = item["life-span"].begin || "Unknown";
          artistEnd = item["life-span"].end || "Present";
          artistTags = item.tags;

          //Create embed
          embeds[index] = new EmbedBuilder({
            title: `Search Result ${index + 1}:`,
            color: 0x353070,
            description:
              `**[${artistName}](https://listenbrainz.org/artist/${MBID})**\n` +
              `Type: ${artistType}\n` +
              `Disambiguation: ${artistDisambiguation}\n` +
              `Begin: ${artistBegin}\n` +
              `End: ${artistEnd}\n` +
              `Area: ${artistArea}\n\n`,
          });

          if (artistTags) {
            const sortedTags = artistTags.sort((a, b) => b.count - a.count);
            let tagsList = "";
            sortedTags.forEach((tag, index) => {
              const linkableTag = tag.name.replaceAll(" ", "%20");
              if (tag.count == 1 && index < 10) {
                tagsList =
                  tagsList +
                  `[${tag.name}](https://musicbrainz.org/tag/${linkableTag}) - ${tag.count} song\n`;
              } else if (tag.count > 1 && index < 10) {
                tagsList =
                  tagsList +
                  `[${tag.name}](https://musicbrainz.org/tag/${linkableTag}) - ${tag.count} songs\n`;
              }
            });
            if (!(tagsList == "")) {
              embeds[index].addFields({ name: "Tags:", value: tagsList });
            }
          }

          break;
        case "release-groups":
          MBID = item.id;
          releaseName = item.title;
          artist = item["artist-credit"][0].artist.name;
          artistMBID = item["artist-credit"][0].artist.id;

          //Create embed
          embeds[index] = new EmbedBuilder({
            title: `Search Result ${index + 1}:`,
            color: 0x353070,
            description: `**[${releaseName}](https://listenbrainz.org/release-group/${MBID})** by *[${artist}](https://listenbrainz.org/artist/${artistMBID})*\n`,
          }).setThumbnail(
            `https://coverartarchive.org/release-group/${MBID}/front-250`
          );
          break;
        case "recordings":
          MBID = item.id;
          recordingName = item.title;
          artist = item["artist-credit"][0].name;
          artistMBID = item["artist-credit"][0].artist.id;
          releaseMBID = item.releases[0].id;
          releaseDate = item["first-release-date"] || "Unknown";

          //Create embed
          embeds[index] = new EmbedBuilder({
            title: `Search Result ${index + 1}:`,
            color: 0x353070,
            description:
              `**[${recordingName}](https://musicbrainz.org/recording/${MBID})** by *[${artist}](https://listenbrainz.org/artist/${artistMBID})*\n` +
              `First released: ${releaseDate}\n\nRelease(s):`,
          }).setThumbnail(
            `https://coverartarchive.org/release/${releaseMBID}/front-250`
          );

          item.releases.forEach((release) => {
            embeds[index].setDescription(
              embeds[index].data.description +
                `\n**[${release.title}](https://musicbrainz.org/release/${release.id})**`
            );
          });
          break;
      }

      MBIDS.push(MBID);
    });
    if (items.length == 0) {
      embeds[0] = new EmbedBuilder({
        title: "Search results",
        description: "No results found",
        color: 0x353070,
      });
      maxPages = 1;
    }

    let currentPage = 0;
    // Create left and right buttons
    const leftButton = new ButtonBuilder({
      customId: "left",
      label: "<",
      style: ButtonStyle.Primary,
    });

    const rightButton = new ButtonBuilder({
      customId: "right",
      label: ">",
      style: ButtonStyle.Primary,
    });

    const relationshipButton = new ButtonBuilder({
      customId: "relationship",
      emoji: "🔗",
      style: ButtonStyle.Secondary,
    });

    // Create a row with the buttons
    const row = new ActionRowBuilder({
      components: [leftButton, rightButton, relationshipButton],
    });

    let message;
    // Send embed
    if (interaction.deferred) {
      message = await interaction.editReply({
        embeds: [
          embeds[currentPage].setFooter({
            text: `Page ${currentPage + 1}/${maxPages}`,
          }),
        ],
        components: [row],
      });
    } else if (!interaction.deferred) {
      message = await interaction.reply({
        embeds: [
          embeds[currentPage].setFooter({
            text: `Page ${currentPage + 1}/${maxPages}`,
          }),
        ],
        components: [row],
      });
    }

    // Create a collector that waits for the user to click the button
    const buttonCollectorFilter = (i) => {
      return i.user.id === interaction.user.id;
    };
    const collector = message.createMessageComponentCollector({
      ComponentType: ComponentType.Button,
      filter: buttonCollectorFilter,
      time: 240_000,
    });

    setTimeout(function () {
      row.components[0].setDisabled(true);
      row.components[1].setDisabled(true);
      message.edit({ components: [row] });
    }, 240_000);

    // Handle the collector
    collector.on("collect", async (i) => {
      // Check if the button was clicked
      if (i.customId === "left") {
        i.deferUpdate();
        // User clicked left
        // Check if first page is active to switch to last
        if (currentPage === 0) {
          // Switch to last page
          currentPage = maxPages - 1;
        } else {
          // Switch to previous page
          currentPage--;
        }
        // Edit embed to show previous 5 listens
        await interaction.editReply({
          embeds: [
            embeds[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${maxPages}`,
            }),
          ],
          components: [row],
        });
      } else if (i.customId === "right") {
        i.deferUpdate();
        // User clicked right
        // Check if last page is active to switch to first
        if (currentPage === maxPages - 1) {
          // Switch to first page
          currentPage = 0;
        } else {
          // Switch to next page
          currentPage++;
        }

        // Edit embed to show next 5 listens
        await interaction.editReply({
          embeds: [
            embeds[currentPage].setFooter({
              text: `Page ${currentPage + 1}/${maxPages}`,
            }),
          ],
          components: [row],
        });
      } else if (i.customId === "relationship") {
        i.deferUpdate();
        // User clicked relationship

        const inc =
          "area-rels+artist-rels+event-rels+instrument-rels+label-rels+place-rels+recording-rels+release-rels+release-group-rels+series-rels+url-rels+work-rels";
        const BASE_URL = `https://musicbrainz.org/ws/2/${searchType.slice(
          0,
          -1
        )}/${MBIDS[currentPage]}?inc=${inc}`;

        const response = await axios.get(BASE_URL, {
          headers: {
            "User-Agent": "DiscordBrainzBot/1.0.0 (coopwd@skiff.com)",
          },
        });
        console.log(response.data.relations);
        let areas = [];
        let artists = [];
        let events = [];
        let instruments = [];
        let labels = [];
        let places = [];
        let recordings = [];
        let releases = [];
        let releaseGroups = [];
        let series = [];
        let urls = [];
        let works = [];
        response.data.relations.forEach((relationship) => {
          // FIXME - Might be able to just use the type to add to var without switch statement
          console.log(relationship.type);
          switch (relationship["target-type"]) {
            case "area":
              areas.push(
                `${relationship.type} [${relationship.area.name}](https://musicbrainz.org/area/${relationship.area.id})`
              );
              break;
            case "artist":
              artists.push(
                `${relationship.type} [${relationship.artist.name}](https://musicbrainz.org/artist/${relationship.artist.id})`
              );
              break;
            case "event":
              events.push(
                `${relationship.type} [${relationship.event.name}](https://musicbrainz.org/event/${relationship.event.id})`
              );
              break;
            case "instrument":
              instruments.push(
                `${relationship.type} [${relationship.instrument.name}](https://musicbrainz.org/instrument/${relationship.instrument.id})`
              );
              break;
            case "label":
              labels.push(
                `${relationship.type} [${relationship.label.name}](https://musicbrainz.org/label/${relationship.label.id})`
              );
              break;
            case "place":
              places.push(
                `${relationship.type} [${relationship.place.name}](https://musicbrainz.org/place/${relationship.place.id})`
              );
              break;
            case "recording":
              recordings.push(
                `${relationship.type} [${relationship.recording.name}](https://musicbrainz.org/recording/${relationship.recording.id})`
              );
              break;
            case "release":
              releases.push(
                `${relationship.type} [${relationship.release.name}](https://musicbrainz.org/release/${relationship.release.id})`
              );
              break;
            case "release-group":
              releaseGroups.push(
                `${relationship.type} [${relationship["release-group"].name}](https://musicbrainz.org/release-group/${relationship["release-group"].id})`
              );
              break;
            case "series":
              series.push(
                `${relationship.type} [${relationship.series.name}](https://musicbrainz.org/series/${relationship.series.id})`
              );
              break;
            case "url":
              urls.push(`[${relationship.type}](${relationship.url.resource})`);
              break;
            case "work":
              works.push(
                `${relationship.type} [${relationship.work.name}](https://musicbrainz.org/work/${relationship.work.id})`
              );
          }
        });
        console.log(areas);
        console.log(artists);
        console.log(events);
        console.log(instruments);
        console.log(labels);
        console.log(places);
        console.log(recordings);
        console.log(releases);
        console.log(releaseGroups);
        console.log(series);
        console.log(urls);
        console.log(works);

        if (areas.length > 0) {
          embeds[currentPage].addFields({
            name: "Areas",
            value: areas.join("\n"),
          });
        }
        if (artists.length > 0) {
          embeds[currentPage].addFields({
            name: "Artists",
            value: artists.join("\n"),
          });
        }
        if (events.length > 0) {
          embeds[currentPage].addFields({
            name: "Events",
            value: events.join("\n"),
          });
        }
        if (instruments.length > 0) {
          embeds[currentPage].addFields({
            name: "Instruments",
            value: instruments.join("\n"),
          });
        }
        if (labels.length > 0) {
          embeds[currentPage].addFields({
            name: "Labels",
            value: labels.join("\n"),
          });
        }
        if (places.length > 0) {
          embeds[currentPage].addFields({
            name: "Places",
            value: places.join("\n"),
          });
        }
        if (recordings.length > 0) {
          embeds[currentPage].addFields({
            name: "Recordings",
            value: recordings.join("\n"),
          });
        }
        if (releases.length > 0) {
          embeds[currentPage].addFields({
            name: "Releases",
            value: releases.join("\n"),
          });
        }
        if (releaseGroups.length > 0) {
          embeds[currentPage].addFields({
            name: "Release Groups",
            value: releaseGroups.join("\n"),
          });
        }
        if (series.length > 0) {
          embeds[currentPage].addFields({
            name: "Series",
            value: series.join("\n"),
          });
        }
        if (urls.length > 0) {
          embeds[currentPage].addFields({
            name: "Urls",
            value: urls.join("\n"),
          });
        }
        if (works.length > 0) {
          embeds[currentPage].addFields({
            name: "Works",
            value: works.join("\n"),
          });
        }

        message.edit({ embeds: [embeds[currentPage]] });
      }
    });
  },
};
