// In a file named `showTeams.js`
import { SlashCommandBuilder } from '@discordjs/builders';
import supabaseModule from "../supabase.js";
const { haq_database } = supabaseModule;
import { opggEmbed } from '../helpers/embedManager.js';

const commandBuilder = new SlashCommandBuilder()
  .setName('showteams')
  .setDescription('Shows OPGG for all approved teams');

const execute = async (interaction) => {
  try {
    // Fetch all approved teams from the Supabase database
    const { data, error } = await haq_database
      .from('inscriptions') // Replace 'teams' with your actual table name
      .select('*')
      .eq('approved', true);
    
    if (error) {
      console.error('Supabase Error:', error);
      await interaction.reply('Failed to fetch teams.');
      return;
    }

    if (data.length === 0) {
      await interaction.reply('No teams are approved.');
      return;
    }

    // Generate the message content
    let messageContent = '';
    for (const team of data) {
      messageContent += `**Team: ${team.team_name}**\n`; // Replace 'name' with your actual column name for the team name
      for (const player of team.players) {
        messageContent += `- ${player.ign}: [OPGG](${player.opgg})\n`;
      }
      messageContent += '\n';
    }

  // Generate the embed
const teamEmbed = opggEmbed(data);

// Send the embed
await interaction.reply({ embeds: [teamEmbed] });

  } catch (err) {
    console.error('Error:', err);
    await interaction.reply('An error occurred while fetching teams.');
  }
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 10
};
