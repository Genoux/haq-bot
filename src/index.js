import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

config();

// // Define the necessary intents
// const intents = new Intents([
//   Intents.FLAGS.GUILDS,
//   Intents.FLAGS.GUILD_MEMBERS
// ]);

//const client = new Client({ intents });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const commands = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);

const buttonHandlers = {};

client.on("ready", async () => {
 // const guild = client.guilds.cache.get('YOUR_GUILD_ID');
 // await guild.members.fetch();
  
  //console.log(`Fetched ${guild.members.cache.size} members`);
  
  console.log(`${client.user.tag} has logged in!`)
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    if (command && typeof command.execute === "function") {
      // ... (rest of the command handling logic)
      await command.execute(interaction);
    }
  } else if (interaction.isButton()) {
    const handler = buttonHandlers[interaction.customId];
    if (handler) {
      try {
        await handler(interaction);
      } catch (error) {
        console.error(`Error handling button: ${interaction.customId}.`, error);
        await interaction.reply({
          content: error.toString(),
          ephemeral: true,
        });
      }
    }
  }
});

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandFiles = fs
    .readdirSync(path.join(dirname, "./commands"))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = (await import(`./commands/${file}`)).default;
    commands.set(command.data.name, command);

    if (command.buttons && typeof command.buttons === "object") {
      for (const [buttonId, handler] of Object.entries(command.buttons)) {
        if (typeof handler === "function") {
          buttonHandlers[buttonId] = handler;
        } else {
          console.warn(`Handler for buttonId '${buttonId}' is not a function.`);
        }
      }
    } else {
      console.warn(
        `Command ${command.data.name} does not have a valid buttons object.`
      );
    }
  }

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: Array.from(commands.values()).map((cmd) => cmd.data),
    });
    client.login(process.env.TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
