const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("betterping")
    .setDescription("Replies with pong with latency!"),
  name: "betterping",
  async execute(interaction) {
    const sent = Date.now();
    await interaction.reply("Better Pong!");
    const received = Date.now();
    const latency = received - sent;
    await interaction.editReply(`Better Pong! Latency: ${latency}ms`);
  },
};
