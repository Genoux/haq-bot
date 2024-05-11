import { EmbedBuilder } from "discord.js";

const formatString = (arr, discordProp, opggProp) => {
  return (
    arr
      .map((player) => {
        const discordValue = player[discordProp] || "-";
        const opggValue = opggProp && player[opggProp] ? `[OP.GG](${player[opggProp]})` : "";
        return `${discordValue} ${opggValue}`;
      })
      .join("\n") || "-"
  );
};

export const createTeamEmbed = (payload) => {
  const embed = new EmbedBuilder()
    .setTitle("New team registration")
    .setDescription(`Team Name: **${payload.name || "-"}**`)
    .setColor("#DCFC35")
    .setTimestamp()
    .addFields([
      { name: "Email", value: payload.email || "-", inline: false },
      { name: "Team info", value: "----------------------------------------------------------", inline: false },
      { name: "Players", value: formatString(payload.players, "discord", "opgg"), inline: true },
      { name: "Coaches", value: formatString(payload.coaches, "discord", ""), inline: true },
      { name: "Substitutes", value: formatString(payload.substitutes, "discord", "opgg"), inline: true },
    ]);

  return embed;
};

export const createDraftDoneEmbed = (data) => {
  const formatHeroes = (heroes) => heroes.map((hero) => hero.name || "-").join(", ");
  
  const embed = new EmbedBuilder()
    .setTitle("Draft done")
    .setDescription(`Match between **${data.blue.name || "-"}** and **${data.red.name || "-"}**`)
    .setColor("#DCFC35")
    .setTimestamp()
    .addFields([
      { name: "-", value: "-----------------------------------------------------------------------", inline: false },
      { name: "Blue Team", value: data.blue.name || "-", inline: false },
      { name: "Selected Heroes", value: formatHeroes(data.blue.heroes_selected), inline: true },
      { name: "Banned Heroes", value: formatHeroes(data.blue.heroes_ban), inline: true },
      { name: "-", value: "-----------------------------------------------------------------------", inline: false },
      { name: "Red Team", value: data.red.name || "-", inline: false },
      { name: "Selected Heroes", value: formatHeroes(data.red.heroes_selected), inline: true },
      { name: "Banned Heroes", value: formatHeroes(data.red.heroes_ban), inline: true },
    ]);

  return embed;
};

export const opggEmbed = (teams) => {
  const embed = new EmbedBuilder()
    .setTitle("Approved Teams and Their OPGG")
    .setDescription("Here are the OPGG links for all approved teams.")
    .setColor("#DCFC35")
    .setTimestamp();
  
  teams.forEach((team) => {
    embed.addFields([
      { name: `Team: ${team.name || "empty"}`, value: formatString(team.players, "discord", "opgg"), inline: false },
    ]);
  });

  return embed;
};
