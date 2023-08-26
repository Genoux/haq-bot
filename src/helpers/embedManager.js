import { EmbedBuilder } from "discord.js";

const formatString = (arr, discordProp, ignProp, opggProp) => {
  return (
    arr
      .map((player) => {
        if (opggProp && player[opggProp]) {
          return `${player[discordProp] || "N/A"} - [OP.GG](${
            player[opggProp]
          }) - ${player[ignProp] || "N/A"}`;
        } else {
          return `${player[discordProp] || "N/A"} - ${
            player[ignProp] || "N/A"
          }`;
        }
      })
      .join("\n") || "N/A"
  );
};

export const createTeamEmbed = (payload) => {
  console.log("Payload:", payload); // Log the payload to debug

  const embed = new EmbedBuilder()
    .setTitle("New team registration")
    .setDescription(
      `Team Name: **${payload.team_name || "N/A"}** - Elo: ${payload.elo}`
    )
    .setColor("#DCFC35")
    .setTimestamp();

  const playersString = formatString(payload.players, "discord", "ign", "opgg");
  const substitutesString = formatString(
    payload.substitutes,
    "discord",
    "ign",
    "opgg"
  );
  const coachesString = formatString(payload.coaches, "discord", "IGN", "");

  embed.addFields([
    {
      name: "Team",
      value:
        "-----------------------------------------------------------------------",
      inline: false,
    },
    { name: "Players", value: playersString, inline: true },
    { name: "Coaches", value: coachesString, inline: true },
    { name: "Substitutes", value: substitutesString, inline: true },
  ]);

  return embed;
};

export const createDraftDoneEmbed = (data) => {
  const blueTeam = data.blue;
  const redTeam = data.red;

  const embed = new EmbedBuilder()
    .setTitle("Draft done")
    .setDescription(
      "Match between **" + blueTeam.name + "** and **" + redTeam.name + "**"
    )
    .setColor("#DCFC35")
    .setTimestamp()

  const formatHeroes = (heroes) => {
    return heroes.map((hero) => hero.name || "N/A").join(", ");
  };

  const blueHeroesSelected = formatHeroes(blueTeam.heroes_selected);
  const blueHeroesBanned = formatHeroes(blueTeam.heroes_ban);
  const redHeroesSelected = formatHeroes(redTeam.heroes_selected);
  const redHeroesBanned = formatHeroes(redTeam.heroes_ban);

  embed.addFields([
    {
      name: "-",
      value:
        "-----------------------------------------------------------------------",
      inline: false,
    },
    { name: "Blue Team", value: blueTeam.name, inline: false },
    { name: "Selected Heroes", value: blueHeroesSelected, inline: true },
    { name: "Banned Heroes", value: blueHeroesBanned, inline: true },
    {
      name: "-",
      value:
        "-----------------------------------------------------------------------",
      inline: false,
    },
    { name: "Red Team", value: redTeam.name, inline: false },
    { name: "Selected Heroes", value: redHeroesSelected, inline: true },
    { name: "Banned Heroes", value: redHeroesBanned, inline: true },
  ]);

  return embed;
};
