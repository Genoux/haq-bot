import { SlashCommandBuilder } from "@discordjs/builders";
import discord, {
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
} from "discord.js";
import {
  deleteAllTeamsChannels,
  resetGeneralChannels,
} from "../helpers/channelManager.js";
import { deleteAllRoles, clearAllRoles } from "../helpers/roleManager.js";

export const buttons = {
  doomsday_confirm: async (interaction) => {
    try {
      await interaction.deferUpdate();

      const userId = interaction.user.id;

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
        try {
          const user = await interaction.client.users.fetch(
            interaction.user.id
          );
          await user.send(
            "An error occurred while processing the Doomsday command."
          );
        } catch (dmError) {
          console.error("Failed to send error DM to user", dmError);
        }
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
      await interaction.update({
        content: "Doomsday command cancelled.",
        components: [], // Remove any buttons
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error handling button: doomsday_cancel", error);

      if (error.code === 10008) {
        try {
          await interaction.followUp({
            content: "Doomsday command cancelled.",
            ephemeral: true,
          });
        } catch (followUpError) {
          console.error("Error sending follow-up message:", followUpError);
        }
      }
    }
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("doomsday")
  .setDescription("The last day of the world's existence.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const execute = async (interaction) => {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  if (interaction.channel.name !== "bot-cmd") {
    await interaction.reply({
      content: "This command can only be used in the #bot-cmd channel.",
      ephemeral: true,
    });
    return;
  }

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
