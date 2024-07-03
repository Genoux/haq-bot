import { config } from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Routes,
  Collection,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  Interaction,
  GuildMember
} from "discord.js";
import { REST } from "@discordjs/rest";
import { server } from "./helpers/server";
import fs from "fs";
import path from "path";

config();

interface Command {
  data: { name: string };
  execute: (interaction: CommandInteraction) => Promise<void>;
  cooldown?: number;
  buttons?: Record<string, (interaction: ButtonInteraction) => Promise<void>>;
  selectMenus?: Record<string, (interaction: StringSelectMenuInteraction) => Promise<void>>;
}

const TOKEN = process.env.TOKEN as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const GUILD_ID = process.env.GUILD_ID as string;

const cooldowns: Map<string, number> = new Map();

export const client: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

if (!client) {
  throw new Error("Client is not defined");
}

const commands: Collection<string, Command> = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);

const buttonHandlers: Record<string, (interaction: ButtonInteraction) => Promise<void>> = {};
const selectMenuHandlers: Record<string, (interaction: StringSelectMenuInteraction) => Promise<void>> = {};

client.on("ready", async () => {
  console.log(`${client.user?.tag} has logged in!`);
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    console.log(`Guild name: ${guild.name}`);
    await guild.commands.fetch();
  }
  await server();
});

client.on("guildMemberAdd", async (member: GuildMember) => {
  console.log(`${member.user.username} joined the server`);
});

function getCooldownKey(interaction: Interaction): string {
  if (interaction.isCommand()) {
    return `${interaction.commandName}:${interaction.user.id}`;
  } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
    return `${interaction.customId}:${interaction.user.id}`;
  }
  return '';
}

async function handleCooldown(interaction: Interaction, command: Command): Promise<boolean> {
  const now = Date.now();
  const cooldownAmount = (command.cooldown || 3) * 1000;

  const key = getCooldownKey(interaction);
  if (!key) return true;

  const existingCooldown = cooldowns.get(key);
  if (existingCooldown) {
    const expirationTime = existingCooldown + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      if (interaction.isRepliable()) {
        await interaction.reply(
          `Please wait ${Math.floor(timeLeft)} more second(s) before reusing the \`${command.data.name}\` command.`
        );
      }
      return false;
    }
  }

  cooldowns.set(key, now);
  setTimeout(() => cooldowns.delete(key), cooldownAmount);
  return true;
}

client.on("interactionCreate", async (interaction: Interaction) => {
  let command: Command | undefined = undefined;

  if (interaction.isCommand()) {
    command = commands.get(interaction.commandName);
  } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
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
      if (interaction.isCommand()) {
        await command.execute(interaction);
      }
    } catch (error) {
      console.error(
        `Error executing command: ${interaction.isCommand() ? interaction.commandName : 'unknown'}.`,
        error
      );
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
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

async function loadCommands(dirname: string): Promise<Collection<string, Command>> {
  const commandFiles = fs
    .readdirSync(path.join(dirname, "./commands"))
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.set(command.data.name, command);
  }

  return commands;
}

function registerHandlers(commands: Collection<string, Command>): void {
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
      cooldowns.set(command.data.name, 0);
    }
  }
}

async function registerCommands(): Promise<void> {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: Array.from(commands.values()).map((cmd) => cmd.data),
    });
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
}

async function main(): Promise<void> {
  const dirname = __dirname;

  const loadedCommands = await loadCommands(dirname);

  registerHandlers(loadedCommands);

  await registerCommands();

  client.login(TOKEN);
}

main();