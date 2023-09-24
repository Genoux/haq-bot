import { EmbedBuilder } from "discord.js";

const formatString = (arr, discordProp, ignProp, opggProp) => {
  return (
    arr
      .map((player) => {
        if (opggProp && player[opggProp]) {
          return `${player[discordProp] || "N/A"} - [OP.GG](${player[opggProp]  || "N/A"}) - ${player[ignProp] || "N/A"}`;
        } else {
          return `${player[discordProp] || "N/A"} - ${player[ignProp] || "N/A"}`;
        }
      })
      .join("\n") || "N/A"
  );
};

export const createTeamEmbed = (payload) => {
  const embed = new EmbedBuilder()
    .setTitle("New team registration")
    .setDescription(
      `Team Name: **${payload.team_name || "N/A"}**`
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

  console.log([
    {
      name: "Elo",
      value: payload.elo || "N/A",
      inline: false,
    },
    {
      name: "Email",
      value: payload.email || "N/A",
      inline: false,
    },
    { name: "Players", value: playersString || "N/A", inline: true },
    { name: "Coaches", value: coachesString || "N/A", inline: true },
    { name: "Substitutes", value: substitutesString || "N/A", inline: true },
  ]);

  embed.addFields([
    {
      name: "Elo",
      value: payload.elo || "N/A",
      inline: false,
    },
    {
      name: "Email",
      value: payload.email || "N/A",
      inline: false,
    },
    {
      name: "Team info",
      value: "----------------------------------------------------------",
      inline: false
    },
    { name: "Players", value: playersString || "N/A", inline: true },
    { name: "Coaches", value: coachesString || "N/A", inline: true },
    { name: "Substitutes", value: substitutesString || "N/A", inline: true },
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


export const opggEmbed = (teams) => {
  const embed = new EmbedBuilder()
    .setTitle("Approved Teams and Their OPGG")
    .setDescription("Here are the OPGG links for all approved teams.")
    .setColor("#DCFC35")
    .setTimestamp();

  for (const team of teams) {
    const teamName = team.name || "N/A"; // Replace 'name' with your actual column name for the team name
    const playersString = formatString(team.players, "discord", "ign", "opgg");

    embed.addFields([
      { name: `Team: ${teamName}`, value: playersString, inline: false },
    ]);
  }

  return embed;
};
