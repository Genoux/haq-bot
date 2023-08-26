import { config } from "dotenv";
import { SlashCommandBuilder } from '@discordjs/builders';
import fetch from "node-fetch";

config();

const commandBuilder = new SlashCommandBuilder()
  .setName('createdraftroom')
  .setDescription('Créez une salle de draft et obtenez les URLs pour les équipes rouge et bleue.')
  .addStringOption(option => 
    option.setName('bleue')
      .setDescription('Entrez le nom de l\'équipe Bleue')
      .setRequired(true))
  .addStringOption(option => 
    option.setName('rouge')
      .setDescription('Entrez le nom de l\'équipe Rouge')
      .setRequired(true));

const execute = async (interaction) => {
  const blueTeamName = interaction.options.getString('bleue');
  const redTeamName = interaction.options.getString('rouge');

  try {
    const response1 = await fetch(process.env.DRAFT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "blueTeamName": blueTeamName,
        "redTeamName": redTeamName
      }),
    });

    const data = await response1.json();

    const domain = process.env.DOMAIN_URL;
    const blueTeamUrl = `${domain}/room/${data.room.id}/${data.blue.id}`;
    const redTeamUrl = `${domain}/room/${data.room.id}/${data.red.id}`;
    
    await interaction.reply(`Blue Team URL (${data.blue.name}): ${blueTeamUrl}\nRed Team URL (${data.red.name}): ${redTeamUrl}`);

  } catch (error) {
    console.error("Error during fetch:", error);
    await interaction.reply('There was an error while creating the draft room.');
  }
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 60
};
