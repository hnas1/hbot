const fetch = require("node-fetch");
require("dotenv").config();
const fs = require("fs");

const token = process.env.token;
const clientId = process.env.clientId;
const guildId = process.env.guildId;

// Read command files
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

const registerCommands = async () => {
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    const json = {
      name: command.data.name,
      description: command.data.description,
      options: command.data.options,
    };

    // Register command
    const response = await fetch(
      `https://discord.com/api/v9/applications/${clientId}/guilds/${guildId}/commands`,
      {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(`Registered command ${data.name}`);
  }
};

registerCommands();
