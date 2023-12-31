module.exports = {
  name: "ping",
  description: "pong!",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocked: ${client.ws.ping}ms`
    );
  },
};
