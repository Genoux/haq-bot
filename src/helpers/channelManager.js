import { PermissionsBitField, ChannelType } from "discord.js";

const createTeamChannel = async (
  interaction,
  categoryId,
  channelName,
  channelType,
  teamRole
) => {
  console.log(teamRole.id);
  try {

    // return if channel already exists
    const existingChannel = interaction.guild.channels.cache.find(
      channel => channel.name === channelName && channel.parentId === categoryId
    );

    if (existingChannel) {
      console.log("Channel already exists:", existingChannel.name);
      return null;
    }

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: channelType,
      parent: categoryId,
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
    // The ID of the desired category (sub-dropdown)
    const categoryIds = ["1247335698114023434", "1247335698114023435"];

    for (const categoryId of categoryIds) {
      // Get the category channel by its ID
      const category = interaction.guild.channels.cache.get(categoryId);

      if (!category) {
        console.log(`Category with ID ${categoryId} not found!`);
        continue; 
      }

      // Filter channels that have this category as their parent
      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === categoryId
      );

      if (channels.length === 0) {
        console.log(`No channels found in category ${category.name}`);
        return;
      }

      // Iterate through the channels and delete them
      for (const [index, channel] of channels.entries()) { 
        console.log(`Deleting channel with Index: ${index}, Name: ${channel.name}`);  

        // Delete the channel
        await channel.delete().catch(console.error);
      }
    }
  } catch (error) { 
    console.error("Error in cleartags:", error);
  }
};

const resetGeneralChannels = async (interaction) => {
  try {
    // The ID of the desired category (sub-dropdown)
    const categoryIds = ["1247344021739667486"];

    for (const categoryId of categoryIds) {
      // Get the category channel by its ID
      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) {
        console.log(`Category with ID ${categoryId} not found!`);
        continue;
      }

      console.log(`Resetting category: ${category.name}`);

      // Filter channels that have this category as their parent
      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === categoryId
      );

      if (!channels.size) {
        console.log(`No channels found in category with ID ${categoryId}`);
        continue;
      }

      // Iterate through the channels and delete them
      for (const [index, channel] of channels.entries()) {
        console.log(
          `Resetting channel ${channel.name}`
        );

        if (channel.type === ChannelType.GuildText) {
          // Clone the channel
          const newChannel = await channel.clone().catch(console.error);

          // Delete the old channel
          await channel.delete().catch(console.error);

          // Optionally: Set the position of the new channel to match the old one
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
