import { SlashCommandBuilder } from "@discordjs/builders";
import discord, {
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import { deleteAllTeamsChannels, resetGeneralChannels } from "../helpers/channelManager.js";
import { deleteAllRoles, clearAllRoles } from "../helpers/roleManager.js";

export const buttons = {
  doomsday_confirm: async (interaction) => {
    try {
      await interaction.deferUpdate();

      await interaction.editReply({
        content: "Loading...",
        components: [],
        ephemeral: true,
      });

      // Execute the operations concurrently
      await Promise.all([
        deleteAllTeamsChannels(interaction),
        resetGeneralChannels(interaction),
        deleteAllRoles(interaction),
        clearAllRoles(interaction),
      ]);

      await interaction.editReply({
        content: "Doomsday reset done!",
        components: [],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error handling button: doomsday_confirm", error);
      if (error.code === 10008) {
        // Handle specific error code (Unknown Message)
        console.error("The message was not found. It might have been deleted.");
      }
      // Optionally, reply with an error message to the user
      await interaction.followUp({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
  doomsday_cancel: async (interaction) => {
    try {
      await interaction.message.delete();
    } catch (error) {
      console.error("Error handling button: doomsday_cancel", error);
    }
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("doomsday")
  .setDescription("The last day of the world's existence.");

const execute = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("doomsday_confirm")
      .setLabel("Yes")
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId("doomsday_cancel")
      .setLabel("Cancel")
      .setStyle(4)
  );

  await interaction.reply({
    content:
      "Are you sure you want to initiate the Doomsday command? This will clear all channels and messages in the specified categories and cannot be undone.",
    components: [row],
    ephemeral: true,
  });
};

export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
  cooldown: 10,
};
