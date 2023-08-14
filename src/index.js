import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import ChannelsCommand from "./commands/channel.js";
config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.on("ready", () => console.log(`${client.user.tag} has logged in!`));

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
    console.log("Chat Command");
});

async function main() {
  const commands = [ChannelsCommand];

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    client.login(process.env.TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
