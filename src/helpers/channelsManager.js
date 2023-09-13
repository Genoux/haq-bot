import { ChannelType, PermissionsBitField  } from 'discord.js';
import { createRole, deleteRole  } from './roleManager.js';

export const createApprovedChannel = async (
  guild, 
  teamName, 
  textCategoryId, 
  voiceCategoryId
) => {
  try {
    const role = await createRole(guild, teamName);
    const permissions = [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone
      },
      {
        id: role.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Speak], // Allow team role
      }
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


export const deleteApprovedChannel = async (
  guild, 
  teamName,
  textCategoryId,
  voiceCategoryId
) => {
  try {
    await deleteRole(guild, teamName);
    // Find and delete the text channel
    const textChannel = guild.channels.cache.find(
      channel => channel.name === teamName && channel.parentId === textCategoryId
    );
    if (textChannel) {
      await textChannel.delete();
      console.log('Text channel has been deleted for the approved team.');
    } else {
      console.log('Text channel not found for the approved team.');
    }

    // Find and delete the voice channel
    const voiceChannel = guild.channels.cache.find(
      channel => channel.name === teamName && channel.parentId === voiceCategoryId
    );
    if (voiceChannel) {
      await voiceChannel.delete();
      console.log('Voice channel has been deleted for the approved team.');
    } else {
      console.log('Voice channel not found for the approved team.');
    }
  } catch (error) {
    console.error('There was an error deleting the channels:', error);
  }
};