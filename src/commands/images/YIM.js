const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const convertSvgToPng = require("../util/convertSvgToPngImage");
const getAuth = require("../util/getAuth");

module.exports = {
  name: "yim",
  description: "Your 2023 Year in Music!",
  category: "Images",
  options: [
    {
      name: "user",
      description: "A ListenBrainz username",
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
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

  callback: async (client, interaction) => {
    const { brainzUsername } = await getAuth(interaction);
    if (interaction.replied) {
      return;
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
        const link = `https://api.listenbrainz.org/1/art/year-in-music/2023/${brainzUsername}?image=${imageType}`;
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
          embed
            .setFooter({
              text: `Page ${currentPage + 1}/${maxPages}`,
            })
            .setImage(`attachment://${attachments[currentPage].name}`),
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
        interaction.editReply({ components: [row] });
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
              embed
                .setFooter({
                  text: `Page ${currentPage + 1}/${maxPages}`,
                })
                .setImage(`attachment://${attachments[currentPage].name}`),
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
              embed
                .setFooter({
                  text: `Page ${currentPage + 1}/${maxPages}`,
                })
                .setImage(`attachment://${attachments[currentPage].name}`),
            ],
            components: [row],
          });
        }
      });
    } else {
      // If image type is provided
      const imageType = interaction.options.get("image").value;
      const link = `https://api.listenbrainz.org/1/art/year-in-music/2023/${brainzUsername}?image=${imageType}`;
      const png = await convertSvgToPng(link);
      const attachment = new AttachmentBuilder(await png, {
        name: `${imageType}.png`,
      });
      interaction.editReply({ files: [attachment] });
    }
  },
};
