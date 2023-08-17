import { EmbedBuilder } from "discord.js";

export const createTeamEmbed = (payload) =>  {
  console.log("Payload:", payload); // Log the payload to debug

  const embed = new EmbedBuilder()
    .setTitle("New team registration")
    .setDescription(`Team Name: **${payload.team_name || "N/A"}** - Elo: ${payload.elo}`)
    .setColor("#DCFC35")
    .setTimestamp();

    const formatString = (arr, discordProp, ignProp, opggProp) => {
      return arr.map(player => {
        if (opggProp && player[opggProp]) {
          return `${player[discordProp] || "N/A"} - [OP.GG](${player[opggProp]}) - ${player[ignProp] || "N/A"}`;
        }
        else {
          return `${player[discordProp] || "N/A"} - ${player[ignProp] || "N/A"}`;
        }
      }).join("\n") || "N/A";
  }
  
  const playersString = formatString(payload.players, 'discord', 'ign', 'opgg');
  const substitutesString = formatString(payload.substitutes, 'discord', 'ign', 'opgg');
  const coachesString = formatString(payload.coaches, 'discord', 'IGN', '');

  embed.addFields([
    {
      name: "Team",
      value: "-----------------------------------------------------------------------",
      inline: false,
    },
    { name: "Players", value: playersString, inline: true },
    { name: "Coaches", value: coachesString, inline: true },
    { name: "Substitutes", value: substitutesString, inline: true },
  ]);

  return embed;
}
