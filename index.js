require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("node:path");
const fetch = require("node-fetch");

const token = process.env.token;
const clientId = process.env.clientId;
const guildId = process.env.guildId;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  retryLimit: 999999,
  restRequestTimeout: 1800000,
});

client.commands = new Collection();
const cooldowns = new Collection();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if (!command.data) continue;

      // register the slash cmds
      (async function () {
        const json = {
          name: command.data.name,
          description: command.data.description,
          //options: command.data.options,
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
      })();

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log("Command loaded", command.data.name);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const channelId = "1171087190869147652";
  const channel = client.channels.cache.get(channelId);

  if (channel) {
    // Send a message to the specified channel
    channel.send("@everyone Hello, I'm online!");
  } else {
    console.error(`Channel with ID ${channelId} not found.`);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      // If user is in cooldown
      const timeLeft = (expirationTime - now) / 1000;
      return interaction.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  } else {
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    // Execute command
    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply("there was an error trying to execute that command!");
    }
  }

  // try {
  //   await command.execute(interaction);
  // } catch (error) {
  //   console.error(error);
  //   if (interaction.replied || interaction.deferred) {
  //     await interaction.followUp({
  //       content: "There was an error while executing this command!",
  //       ephemeral: true,
  //     });
  //   } else {
  //     await interaction.reply({
  //       content: "There was an error while executing this command!",
  //       ephemeral: true,
  //     });
  //   }
  // }
});

client.login(process.env.token);
