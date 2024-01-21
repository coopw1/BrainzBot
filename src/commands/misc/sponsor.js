const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "sponsor",
  description: "Display info about sponsoring the bot!",
  category: "Misc",

  callback: async (client, interaction) => {
    const embed = new EmbedBuilder({
      color: 0xeb743b,
      title: "Support the bot!",
      description:
        "Any support will go towards hosting the bot and allow me to dedicate more time towards developing it! ",
      url: "https://github.com/sponsors/coopw1",
      footer: {
        text: "Thank you for your support!",
      },
    });

    await interaction.reply({ embeds: [embed] });
  },
};
