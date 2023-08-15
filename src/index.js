import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import fetch from 'node-fetch';


config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const cooldowns = new Map(); // Collection for storing cooldowns

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const commands = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);

const buttonHandlers = {};

client.on("ready", async () => {
  console.log(`${client.user.tag} has logged in!`);
  await client.guilds.cache.get(GUILD_ID).commands.fetch()

});


client.on("interactionCreate", async (interaction) => {
  
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    
    if (command) {
      const now = Date.now();
      const cooldownAmount = (command.cooldown || 3) * 1000;
      
      if (cooldowns.has(`${interaction.user.id}-${command.data.name}`)) {
        const expirationTime = cooldowns.get(`${interaction.user.id}-${command.data.name}`) + cooldownAmount;
        
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return await interaction.reply(`Please wait ${Math.floor(timeLeft)} more second(s) before reusing the \`${command.data.name}\` command.`);
        }
      }
      
      cooldowns.set(`${interaction.user.id}-${command.data.name}`, now);
      setTimeout(() => cooldowns.delete(`${interaction.user.id}-${command.data.name}`), cooldownAmount);
      
      try {
        if (typeof command.execute === "function") {
          await command.execute(interaction);
        }
      } catch (error) {
        console.error(`Error executing command: ${interaction.commandName}.`, error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      }
    }
  } 
  else if (interaction.isButton()) {
    const handler = buttonHandlers[interaction.customId];
    
    if (handler) {
      try {
        await handler(interaction);
      } catch (error) {
        console.error(`Error handling button: ${interaction.customId}.`, error);
        await interaction.reply({
          content: 'There was an error while handling this button!',
          ephemeral: true
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