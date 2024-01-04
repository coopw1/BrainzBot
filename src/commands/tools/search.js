const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const pagination = require("../util/pagination");
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
    // {
    //   name: "artist",
    //   description: "Search for a artist",
    //   type: ApplicationCommandOptionType.Subcommand,
    //   options: [
    //     {
    //       name: "artist",
    //       description: "(part of) the artist's name",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //     },
    //     {
    //       name: "country",
    //       description: "the 2-letter country code for the artist",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //       minLength: 2,
    //       maxLength: 2,
    //     },
    //     {
    //       name: "alive",
    //       description: "whether the artist is alive",
    //       type: ApplicationCommandOptionType.Boolean,
    //       required: false,
    //     },
    //     {
    //       name: "gender",
    //       description: "the artist's gender",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //       choices: [
    //         {
    //           name: "Male",
    //           value: "male",
    //         },
    //         {
    //           name: "Female",
    //           value: "female",
    //         },
    //         {
    //           name: "Other",
    //           value: "other",
    //         },
    //         {
    //           name: "Not Applicable",
    //           value: "not applicable",
    //         },
    //       ],
    //     },
    //     {
    //       name: "type",
    //       description: "the artist's type (“person”, “group”, etc.)",
    //       type: ApplicationCommandOptionType.String,
    //       choices: [
    //         {
    //           name: "Person",
    //           value: "person",
    //         },
    //         {
    //           name: "Group",
    //           value: "group",
    //         },
    //         {
    //           name: "Choir",
    //           value: "choir",
    //         },
    //         {
    //           name: "Character",
    //           value: "character",
    //         },
    //         {
    //           name: "Other",
    //           value: "other",
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   name: "album",
    //   description: "Search for an album",
    //   type: ApplicationCommandOptionType.Subcommand,
    //   options: [
    //     {
    //       name: "release",
    //       description: "the name of the album",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //     },
    //     {
    //       name: "artist",
    //       description: "(part of) the combined credited artist's name",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //     },
    //     {
    //       name: "country",
    //       description: "the 2-letter code country for the release",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //       minLength: 2,
    //       maxLength: 2,
    //     },
    //     {
    //       name: "lang",
    //       description: "the 3-letter language code for the release",
    //       type: ApplicationCommandOptionType.String,
    //       required: false,
    //       minLength: 3,
    //       maxLength: 3,
    //     },
    //     {
    //       name: "tracks",
    //       description: "the total number of tracks on the release",
    //       type: ApplicationCommandOptionType.Integer,
    //       required: false,
    //     },
    //   ],
    // },
  ],

  callback: async (client, interaction) => {
    interaction.deferReply();

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
        if (interaction.options.getString("release")) {
          options.release = interaction.options.getString("release");
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

    let searchType;
    switch (interaction.options.getSubcommand()) {
      case "artist":
        searchType = "artists";
        break;
      case "album":
        searchType = "releases";
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
    };

    // Make request to MusicBrainz
    const response = await axios.get(BASE_URL, PARAMS);

    const items = await response.data[searchType];
    const maxLength = items.length;

    const baseEmbed = {
      title: "Search results",
      color: 0x353070,
    };

    // Create list of all 25 items
    const embeds = [];

    items.forEach((item, index) => {
      switch (searchType) {
        case "artists":
          break;
        case "releases":
          break;
        case "recordings":
          const MBID = item.id;
          const name = item.title;
          const artist = item["artist-credit"][0].name;
          const artistMBID = item["artist-credit"][0].artist.id;
          const releaseMBID = item.releases[0].id;

          //Create embed
          embeds[index] = new EmbedBuilder({
            title: `Search Result ${index + 1}:`,
            color: 0x353070,
            description: `**[${name}](https://musicbrainz.org/recording/${MBID})** by *[${artist}](https://musicbrainz.org/artist/${artistMBID})*\n\nRelease(s):`,
          }).setThumbnail(
            `https://coverartarchive.org/release/${releaseMBID}/front-250`
          );

          item.releases.forEach((release) => {
            console.log(
              embeds[index].data.description +
                `**[${release.title}](https://musicbrainz.org/release/${release.id})**`
            );
            embeds[index].setDescription(
              embeds[index].data.description +
                `\n**[${release.title}](https://musicbrainz.org/release/${release.id})**`
            );
          });
          break;
      }
    });

    pagination(interaction, embeds, maxLength, "", true);
  },
};
