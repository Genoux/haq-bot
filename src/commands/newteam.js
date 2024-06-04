import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType,   StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder, } from 'discord.js';
import supabaseModule from "../supabase.js";
const { live_tournament } = supabaseModule; // Adjust this import to where your supabase client is initialized
import { createRole } from "../helpers/roleManager.js";
import { createTeamChannel } from "../helpers/channelManager.js";

const commandBuilder = new SlashCommandBuilder()
  .setName('newteam')
  .setDescription("Create a new team")
  .addStringOption((option) =>
    option
      .setName('team_name')
      .setDescription('Enter the team name')
      .setRequired(true)
  );

const execute = async (interaction) => {
  const teamName = interaction.options.getString('team_name');
  const { data: inscriptions, error } = await live_tournament
  .from("inscriptions")
  .select("*")
  
  console.log(inscriptions)

  try {
    const newTeam = await createTeam(interaction, teamName);
    console.log(newTeam)
    if (newTeam) {
      await interaction.reply({
        content: `Team **${newTeam.name}** created successfully!`,
        ephemeral: true,
      });
    }else {
      await interaction.reply({
        content: "Team already exist.",
        ephemeral: true,
      });
    }

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error creating the team. Please try again later.",
      ephemeral: true,
    });
  }
};

const createTeam = async (interaction, teamName) => {
  const textCategoryId = '1247335698114023434'; // replace with your actual text category ID
  const voiceCategoryId = '1247335698114023435'; // replace with your actual voice category ID

  const teamRole = await createRole(interaction, teamName)
  if (!teamRole) {
    return null;
  }
  const textChannel = await createTeamChannel(interaction, textCategoryId, teamName, ChannelType.GuildText, teamRole)
  const voiceChannel = await createTeamChannel(interaction, voiceCategoryId, teamName, ChannelType.GuildVoice, teamRole)

  return {
    name: teamName,
    channel: textChannel,
    voiceChannel: voiceChannel,
    role: teamRole,
  };
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 5,
};
