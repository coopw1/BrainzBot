const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const userData = require("../../../schemas/userData");
const convertSvgToPng = require("../util/convertSvgToPng");

module.exports = {
  name: "yim",
  description: "Your 2023 Year in Music!",
  category: "Images",
  options: [
    {
      name: "user",
      description: "User",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "image",
      description: "Time period",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: "Overview",
          value: "overview",
        },
        {
          name: "Stats",
          value: "stats",
        },
        {
          name: "Top Artists",
          value: "artists",
        },
        {
          name: "Top Albums",
          value: "albums",
        },
        {
          name: "Top tracks",
          value: "tracks",
        },
        {
          name: "Top Discoveries",
          value: "discovery-playlist",
        },
        {
          name: "Songs you missed",
          value: "missed-playlist",
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

    // Check if image type is provided
    if (!interaction.options.get("image")) {
      // If not, show all with pages
      const imageTypes = [
        "overview",
        "stats",
        "artists",
        "albums",
        "tracks",
        "discovery-playlist",
        "missed-playlist",
      ];

      let attachments = [];
      for (const imageType of imageTypes) {
        link = `https://api.listenbrainz.org/1/art/year-in-music/2023/${brainzUsername}?image=${imageType}`;
        const png = await convertSvgToPng(link);
        const attachment = new AttachmentBuilder(await png, {
          name: `${imageType}.png`,
        });
        attachments.push(attachment);
      }

      const embed = new EmbedBuilder({
        color: 0xf0eee2,
        title: `${brainzUsername}'s 2023 Year in Music!`,
        url: `https://listenbrainz.org/user/${brainzUsername}/year-in-music/2023`,
      });

      let currentPage = 0;
      const maxPages = attachments.length;
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

      // Create a row with the buttons
      const row = new ActionRowBuilder({
        components: [leftButton, rightButton],
      });

      let message = await interaction.editReply({
        files: [attachments[currentPage]],
        embeds: [
          embed.setFooter({
            text: `Page ${currentPage + 1}/${maxPages}`,
          }),
        ],
        components: [row],
      });

      const buttonCollectorFilter = (i) => {
        return i.user.id === interaction.user.id;
      };
      const collector = message.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter: buttonCollectorFilter,
        time: 1_00_000,
      });

      setTimeout(function () {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        message.edit({ components: [row] });
      }, 600_000);

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
          message = await interaction.editReply({
            files: [attachments[currentPage]],
            embeds: [
              embed.setFooter({
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

          // Edit embed to show YIM page
          message = await interaction.editReply({
            files: [attachments[currentPage]],
            embeds: [
              embed.setFooter({
                text: `Page ${currentPage + 1}/${maxPages}`,
              }),
            ],
            components: [row],
          });
        }
      });
    } else {
      // If image type is provided
      const imageType = interaction.options.get("image").value;
      link = `https://api.listenbrainz.org/1/art/year-in-music/2023/${brainzUsername}?image=${imageType}`;
      const png = await convertSvgToPng(link);
      const attachment = new AttachmentBuilder(await png, {
        name: `${imageType}.png`,
      });
      interaction.editReply({ files: [attachment] });
    }
  },
};
