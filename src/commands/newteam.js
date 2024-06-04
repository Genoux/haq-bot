import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionsBitField } from 'discord.js';

const commandBuilder = new SlashCommandBuilder()
  .setName('newteam')
  .setDescription("Create a new team")
  .addStringOption((option) =>
    option
      .setName('team_name')
      .setDescription('Enter the team name')
      .setRequired(true)
  );

const getRandomColor = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const execute = async (interaction) => {
  const teamName = interaction.options.getString('team_name');

  try {
    const newTeam = await createTeam(interaction, teamName);
    await interaction.reply({
      content: `Team **${newTeam.name}** created successfully!`,
      ephemeral: true,
    });
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

  const teamRole = await interaction.guild.roles.create({
    name: teamName,
    color: `#${getRandomColor()}`,
    mentionable: true,
  });

  // Deny all permissions except ViewChannel for everyone
  const everyonePermissions = {
    id: interaction.guild.roles.everyone.id,
    deny: PermissionsBitField.All,
    allow: PermissionsBitField.Flags.ViewChannel,
  };

  // Allow necessary permissions for the team role
  const teamRolePermissions = {
    id: teamRole.id,
    allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
    ],
  };

  const teamChannel = await interaction.guild.channels.create({
    name: teamName,
    type: ChannelType.GuildText,
    parent: textCategoryId,
    permissionOverwrites: [everyonePermissions, teamRolePermissions],
  });

  const voiceChannel = await interaction.guild.channels.create({
    name: teamName,
    type: ChannelType.GuildVoice,
    parent: voiceCategoryId,
    permissionOverwrites: [everyonePermissions, teamRolePermissions],
  });

  return {
    name: teamName,
    channel: teamChannel,
    voiceChannel: voiceChannel,
    role: teamRole,
  };
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 5,
};
