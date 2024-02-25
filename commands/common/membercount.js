const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Outputs the current server member count"),
  name: "membercount",
  aliases: ["mc"],
  description: "Outputs the current server member count",
  category: "category",
  guildOnly: true,
  memberpermissions: "VIEW_CHANNEL",
  adminPermOverride: true,
  cooldown: 2,
  usage: "<usage>",
  execute(interaction) {
    interaction.reply(
      `**${interaction.guild.name}** member count: ${interaction.guild.memberCount}`
    );
  },
};
