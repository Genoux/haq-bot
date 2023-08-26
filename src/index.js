import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from "url";
import { newMember } from "./helpers/memberManager.js";
import { subscribe } from "./helpers/subscription.js";
import fs from "fs";
import path from "path";

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const cooldowns = new Map(); // Collection for storing cooldowns

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const commands = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);

const buttonHandlers = {};
const selectMenuHandlers = {};

client.on("ready", async () => {
  console.log(`${client.user.tag} has logged in!`);
  await client.guilds.cache.get(GUILD_ID).commands.fetch();

  subscribe(client);

});

client.on("guildMemberAdd", async (member) => {
  await newMember(member);
});

function getCooldownKey(interaction) {
  if (interaction.isCommand()) {
    return `${interaction.commandName}:${interaction.user.id}`;
  } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
    return `${interaction.customId}:${interaction.user.id}`;
  }
}

async function handleCooldown(interaction, command) {
  const now = Date.now();
  const cooldownAmount = (command.cooldown || 3) * 1000;

  const key = getCooldownKey(interaction);

  if (cooldowns.has(key)) {
    const expirationTime = cooldowns.get(key) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await interaction.reply(
        `Please wait ${Math.floor(
          timeLeft
        )} more second(s) before reusing the \`${command.data.name}\` command.`
      );
      return false;
    }
  }

  cooldowns.set(key, now);
  setTimeout(() => cooldowns.delete(key), cooldownAmount);
  return true;
}

client.on("interactionCreate", async (interaction) => {
  let command = null;

  if (interaction.isCommand()) {
    command = commands.get(interaction.commandName);
  } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
    // Retrieve the associated command name from the customId, if set
    const parts = interaction.customId.split(":");
    if (parts.length > 1) {
      const commandName = parts[0];
      command = commands.get(commandName);
    }
  }

  if (command) {
    if (!(await handleCooldown(interaction, command))) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error executing command: ${interaction.commandName}.`,
        error
      );
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    const handler = buttonHandlers[interaction.customId];

    if (handler) {
      try {
        await handler(interaction);
      } catch (error) {
        console.error(`Error handling button: ${interaction.customId}.`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "There was an error while handling this button!",
            ephemeral: true,
          });
        }
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    const handler = selectMenuHandlers[interaction.customId];

    if (handler) {
      try {
        await handler(interaction);
      } catch (error) {
        console.error(
          `Error handling select menu: ${interaction.customId}.`,
          error
        );
        await interaction.reply({
          content: "There was an error while handling this select menu!",
          ephemeral: true,
        });
      }
    }
  }
});

async function loadCommands(dirname) {
  const commandFiles = fs
    .readdirSync(path.join(dirname, "./commands"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.set(command.data.name, command);
  }

  return commands;
}

function registerHandlers(commands) {
  for (const command of commands.values()) {
    if (command.selectMenus) {
      for (const [selectMenuId, handler] of Object.entries(
        command.selectMenus
      )) {
        if (typeof handler === "function") {
          selectMenuHandlers[selectMenuId] = handler;
        }
      }
    }

    if (command.buttons) {
      for (const [buttonId, handler] of Object.entries(command.buttons)) {
        if (typeof handler === "function") {
          buttonHandlers[buttonId] = handler;
        }
      }
    }

    if (command.cooldown) {
      cooldowns.set(command.data.name, new Map());
    }
  }
}

async function registerCommands() {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: Array.from(commands.values()).map((cmd) => cmd.data),
    });
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
}

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const commands = await loadCommands(dirname);

  registerHandlers(commands);

  await registerCommands(commands);

  // rest.delete(Routes.applicationCommand(CLIENT_ID, '1140452888578105447'))
  // .then(() => console.log('Successfully deleted application command'))
  // .catch(console.error);

  client.login(process.env.TOKEN);
}

main();
