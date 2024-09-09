module.exports = {
  name: "ping",
  description: "pong!",
  category: "Misc",
  contexts: [0, 1, 2],
  integrationTypes: [0, 1],

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
    );
  },
};
