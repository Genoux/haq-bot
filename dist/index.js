import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes, Collection, EmbedBuilder, } from "discord.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from "url";
import { newMember } from "./helpers/memberManager.js";
import supabase from "./supabase.js";
import fs from "fs";
import path from "path";
import { createTeamEmbed } from "./helpers/embedManager.js";
import fetch from "node-fetch";
config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const cooldowns = new Map(); // Collection for storing cooldowns
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const commands = new Collection();
const rest = new REST({ version: "10" }).setToken(TOKEN);
const buttonHandlers = {};
const selectMenuHandlers = {};
client.on("ready", async () => {
    console.log(`${client.user.tag} has logged in!`);
    await client.guilds.cache.get(GUILD_ID).commands.fetch();
    const channel = client.channels.cache.find(ch => ch.name === 'notifications');
    // const payload = {
    //   approved: false,
    //   captain: "d",
    //   coaches: [
    //     { IGN: "ddww", discord: "wd" },
    //     { IGN: "qq", discord: "d" },
    //   ],
    //   created_at: "2023-08-17T21:31:24.33597+00:00",
    //   email: "qwdqwd@j.lol",
    //   id: 217,
    //   name: "qwddqw",
    //   players: [
    //     {
    //       discord: "d",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //     {
    //       discord: "wd",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //     {
    //       discord: "dw",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //     {
    //       discord: "wd",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //     {
    //       discord: "wd",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //   ],
    //   substitutes: [
    //     {
    //       discord: "dw",
    //       ign: "Isles1",
    //       opgg: "https://www.op.gg/summoners/na/Isles1",
    //     },
    //   ],
    //   team_name: "wddqw",
    //   elo: 1,
    // };
    // const embed = new EmbedBuilder()
    //   .setTitle("New team registration")
    //   .setDescription(
    //     `Team Name: **${payload.team_name || "N/A"}** - Elo: ${payload.elo}`
    //   )
    //   .setColor("#DCFC35")
    //   .setTimestamp();
    // const playersString =
    //   payload.players
    //     .map((player) => {
    //       return `${player.discord} - [OP.GG](${player.opgg}) - ${player.ign}`;
    //     })
    //     .join("\n") || "N/A";
    // const substitutesString =
    //   payload.substitutes
    //     .map((substitute) => {
    //       return `${substitute.discord} - ${substitute.ign}`;
    //     })
    //     .join("\n") || "N/A";
    // // Format the coaches array into a string
    // const coachesString =
    //   payload.coaches
    //     .map((coach) => {
    //       return `${coach.IGN} - ${coach.discord}`;
    //     })
    //     .join("\n") || "N/A";
    // embed.addFields([
    //   {
    //     name: "Team",
    //     value:
    //       "-----------------------------------------------------------------------",
    //     inline: false,
    //   },
    //   { name: "Players", value: playersString, inline: true },
    //   { name: "Coaches", value: coachesString, inline: true },
    //   { name: "Substitutes", value: substitutesString, inline: true },
    // ]);
    // channel.send({ embeds: [embed] });
    supabase
        .channel("*")
        .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "inscriptions",
    }, ({ new: payload }) => {
        console.log("client.on - payload:", payload);
        // Create an embed from the payload
        const teamEmbed = createTeamEmbed(payload);
        // Send the embed to the channel
        channel.send({ embeds: [teamEmbed] });
    })
        .subscribe((status, err) => {
        if (!err) {
            console.log("Subbed to database", status);
        }
        else {
            console.log(err);
        }
    });
});
client.on("guildMemberAdd", async (member) => {
    await newMember(member);
});
function getCooldownKey(interaction) {
    if (interaction.isCommand()) {
        return `${interaction.commandName}:${interaction.user.id}`;
    }
    else if (interaction.isButton() || interaction.isStringSelectMenu()) {
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
            await interaction.reply(`Please wait ${Math.floor(timeLeft)} more second(s) before reusing the \`${command.data.name}\` command.`);
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
    }
    else if (interaction.isButton() || interaction.isStringSelectMenu()) {
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
        }
        catch (error) {
            console.error(`Error executing command: ${interaction.commandName}.`, error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
    else if (interaction.isButton()) {
        const handler = buttonHandlers[interaction.customId];
        if (handler) {
            try {
                await handler(interaction);
            }
            catch (error) {
                console.error(`Error handling button: ${interaction.customId}.`, error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "There was an error while handling this button!",
                        ephemeral: true,
                    });
                }
            }
        }
    }
    else if (interaction.isStringSelectMenu()) {
        const handler = selectMenuHandlers[interaction.customId];
        if (handler) {
            try {
                await handler(interaction);
            }
            catch (error) {
                console.error(`Error handling select menu: ${interaction.customId}.`, error);
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
            for (const [selectMenuId, handler] of Object.entries(command.selectMenus)) {
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
    }
    catch (err) {
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
