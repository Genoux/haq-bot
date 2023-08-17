import { ChannelType, PermissionsBitField  } from 'discord.js';
import { createRole } from '../helpers/roleManager.js';

export const createApprovedChannel = async (
  guild, 
  teamName, 
  textCategoryId, 
  voiceCategoryId
) => {
  console.log("guild:", guild);
  console.log("teamName:", teamName);
  try {

    const role = await createRole(guild, teamName, 'FF0000');
    const permissions = [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone
      },
      {
        id: role.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect], // Allow team role
      },
    ];

    await guild.channels.create({
      name: teamName,
      type: ChannelType.GuildText,
      parent: textCategoryId,
      permissionOverwrites: permissions,
    });

    // Create a voice channel in the specified category
    await guild.channels.create({
      name: teamName,
      type: ChannelType.GuildVoice,
      parent: voiceCategoryId,
      permissionOverwrites: permissions,
    });
    
    console.log('Channels have been created for the approved team.');
  } catch (error) {
    console.error('There was an error creating the channels:', error);
  }
};
