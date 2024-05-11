import { SlashCommandBuilder } from "@discordjs/builders";
import discord, { ActionRowBuilder, ButtonBuilder } from "discord.js";

export const buttons = {
  reset_confirm: async (interaction) => {
    await interaction.deferUpdate();

    await interaction.editReply({
      content: "Loading...",
      components: [],
      ephemeral: true,
    });

    await resetchannels(interaction);

    await interaction.editReply({
      content: "Server settings reset successfully!",
      components: [],
      ephemeral: true,
    });
  },
  reset_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("resetchannels")
  .setDescription(
    "Deletes voice and text channels for teams in specified categories."
  );

const execute = async (interaction) => {
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
    content: "Are you sure you want to execute the resetchannels command? This will delete all voice and text channels designated for teams in the specified categories. This action cannot be undone.",
    components: [row],
    ephemeral: true,
  });
};

export const resetchannels = async (interaction) => {
  try {
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
      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === categoryId
      );

      // Iterate through the channels and delete them
      for (const [index, channel] of channels.entries()) {
        console.log(
          `Deleting channel with Index: ${index}, Name: ${channel.name}`
        );

        // Delete the channel
        await channel.delete().catch(console.error);
      }
    }
  } catch (error) {
    console.error("Error in cleartags:", error);
  }
};

export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
  cooldown: 10,
};
