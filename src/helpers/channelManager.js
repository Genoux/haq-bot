import { PermissionsBitField, ChannelType } from "discord.js";

const getCategoryByName = (guild, categoryName) => {
  return guild.channels.cache.find(
    channel => channel.type === ChannelType.GuildCategory && channel.name === categoryName
  );
};

const createTeamChannel = async (
  interaction,
  categoryName,
  channelName,
  channelType,
  teamRole
) => {
  const category = getCategoryByName(interaction.guild, categoryName);
  if (!category) {
    console.log(`Category with name ${categoryName} not found!`);
    return null;
  }

  console.log(teamRole.id);
  try {
    // return if channel already exists
    const existingChannel = interaction.guild.channels.cache.find(
      channel => channel.name === channelName && channel.parentId === category.id
    );

    if (existingChannel) {
      console.log("Channel already exists:", existingChannel.name);
      return null;
    }

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: channelType,
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: PermissionsBitField.All,
          allow: PermissionsBitField.Flags.ViewChannel,
        },
        {
          id: teamRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.AddReactions,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.SendMessagesInThreads,
          ], // Allow team role
          deny: [
            PermissionsBitField.Flags.AttachFiles,
          ]
        },
      ],
    });

    console.log("Channel created:", channel.name);
    return channel;
  } catch (error) {
    console.error("Error creating channel:", error);
    throw new Error("There was an error creating the channel.");
  }
};

const deleteAllTeamsChannels = async (interaction) => {
  try {
    const categoryNames = ["Voice Channels", "Text Channels"];

    for (const categoryName of categoryNames) {
      const category = getCategoryByName(interaction.guild, categoryName);
      if (!category) {
        console.log(`Category with name ${categoryName} not found!`);
        continue;
      }

      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === category.id
      );

      if (channels.length === 0) {
        console.log(`No channels found in category ${category.name}`);
        return;
      }

      for (const [index, channel] of channels.entries()) { 
        console.log(`Deleting channel with Name: ${channel.name}`);  
        await channel.delete().catch(console.error);
      }
    }
  } catch (error) { 
    console.error("Error in cleartags:", error);
  }
};

const resetGeneralChannels = async (interaction) => {
  try {
    const categoryNames = ["General"];

    for (const categoryName of categoryNames) {
      const category = getCategoryByName(interaction.guild, categoryName);
      if (!category) {
        console.log(`Category with name ${categoryName} not found!`);
        continue;
      }

      console.log(`Resetting category: ${category.name}`);

      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === category.id
      );

      if (!channels.size) {
        console.log(`No channels found in category with name ${categoryName}`);
        continue;
      }

      for (const [index, channel] of channels.entries()) {
        console.log(
          `Resetting channel ${channel.name}`
        );

        if (channel.type === ChannelType.GuildText) {
          const newChannel = await channel.clone().catch(console.error);
          await channel.delete().catch(console.error);
          if (newChannel) {
            await newChannel.setPosition(channel.position).catch(console.error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in resetchannels:", error);
  }
};

export { createTeamChannel, deleteAllTeamsChannels, resetGeneralChannels };
