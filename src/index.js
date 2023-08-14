import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);

client.on("ready", () => console.log(`${client.user.tag} has logged in!`));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
      console.log("Interaction is not a chat input command. Ignoring.");
      return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
      console.log(`No command found for name: ${interaction.commandName}. Ignoring.`);
      return;
  }

  try {
      await command.execute(interaction);
  } catch (error) {
      console.error(`Error executing command: ${interaction.commandName}.`, error);
      await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
  }
});

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandFiles = fs.readdirSync(path.join(dirname, './commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.set(command.data.name, command);
  }

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: Array.from(commands.values()).map(cmd => cmd.data),
    });
    client.login(process.env.TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
