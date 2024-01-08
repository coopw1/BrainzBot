const { EmbedBuilder } = require("discord.js");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = {
  name: "help",
  description: "Shows all commands",
  category: "Misc",
  hide: true,
  //   options: [
  //     {
  //       name: "command",
  //       description: "Pick a command to see more info about!",
  //       type: ApplicationCommandOptionType.String,
  //       required: false,
  //     },
  //   ],

  callback: async (client, interaction) => {
    const embed = new EmbedBuilder({
      color: 0x353070,
      title: "All commands",
      footer: {
        // text: "Use /help command:<command> for more info.",
        text: "boop",
      },
    });

    // Get all commands
    const localCommands = await getLocalCommands();

    // Group commands by category
    const commandsByCategory = {};
    for (const command of localCommands) {
      if (command.hide) continue;

      const category = command.category || "Uncategorized";
      if (!commandsByCategory[category]) {
        commandsByCategory[category] = [];
      }
      commandsByCategory[category].push(command);
    }

    // Add commands to embed by category
    for (const category in commandsByCategory) {
      const commands = commandsByCategory[category];
      const commandList = commands.map((command) => {
        return `**/${command.name}** - ${command.description}`;
      });
      embed.addFields({ name: category, value: commandList.join("\n") });
    }

    interaction.reply({ embeds: [embed] });
  },
};
