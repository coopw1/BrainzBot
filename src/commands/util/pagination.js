const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

module.exports = async (interaction, embeds, maxPages, footer = "") => {
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

  // Create a row with the buttons
  const row = new ActionRowBuilder({
    components: [leftButton, rightButton],
  });

  let message;
  // Send embed
  if (interaction.deferred) {
    message = await interaction.editReply({
      embeds: [
        embeds[currentPage].setFooter({
          text: `Page ${currentPage + 1}/${maxPages}${footer}`,
        }),
      ],
      components: [row],
    });
  } else if (!interaction.deferred) {
    message = await interaction.reply({
      embeds: [
        embeds[currentPage].setFooter({
          text: `Page ${currentPage + 1}/${maxPages}${footer}`,
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
            text: `Page ${currentPage + 1}/${maxPages}${footer}`,
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
            text: `Page ${currentPage + 1}/${maxPages}${footer}`,
          }),
        ],
        components: [row],
      });
    }
  });
};
