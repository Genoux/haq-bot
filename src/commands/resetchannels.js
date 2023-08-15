import { SlashCommandBuilder } from "@discordjs/builders";
import discord, { ActionRowBuilder, ButtonBuilder } from "discord.js";
const { MessageActionRow, MessageButton } = discord;

export const buttons = {
  reset_confirm: async (interaction) => {
    await resetchannels(interaction);

   // await interaction.message.delete();
    // Handle the reset confirmation button click
  },
  reset_cancel: async (interaction) => {
    await interaction.message.delete();
    // Handle the reset cancellation button click
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("resetchannels")
  .setDescription(
    "Resets various server settings, including renaming channels."
  );

const execute = async (interaction) => {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply("This command can only be used in a server.");
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reset_confirm")
      .setLabel("Yes")
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId("reset_cancel")
      .setLabel("Cancel")
      .setStyle(4)
  );

  await interaction.reply({
    content: "Are you sure you want to reset server settings?",
    components: [row],
  });
};

const resetchannels = async (interaction) => {
  // The ID of the desired category (sub-dropdown)
  const categoryIds = ["1080911803854356670", "1109480250108289124"];

  for (const categoryId of categoryIds) {
      // Get the category channel by its ID
      const category = interaction.guild.channels.cache.get(categoryId);
      
      if (!category) {
          console.log(`Category with ID ${categoryId} not found!`);
          continue;
      }
      
      console.log(`Resetting category: ${category.name}`);
      
      // Filter channels that have this category as their parent
      const channels = interaction.guild.channels.cache.filter(ch => ch.parentId === categoryId);
      
      // Iterate through the channels and delete them
      for (const [index, channel] of channels.entries()) {
          console.log(`Deleting channel with Index: ${index}, Name: ${channel.name}`);
          
          // Delete the channel
          await channel.delete().catch(console.error);
      }
  }

  await interaction.update({
    content: "Server settings reset successfully!",
    components: [],
  });
};

export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
};
