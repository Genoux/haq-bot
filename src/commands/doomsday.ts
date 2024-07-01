import { SlashCommandBuilder } from "@discordjs/builders";
import discord, {
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  Interaction,
  CommandInteraction,
  ButtonInteraction,
  GuildMember,
  ChatInputCommandInteraction
} from "discord.js";
import {
  deleteAllTeamsChannels,
  resetGeneralChannels,
} from "../helpers/channelManager";
import { deleteAllRoles, clearAllRoles } from "../helpers/roleManager";

interface ButtonHandlers {
  [key: string]: (interaction: ButtonInteraction) => Promise<void>;
}

export const buttons: ButtonHandlers = {
  doomsday_confirm: async (interaction: ButtonInteraction) => {
    try {
      await interaction.deferUpdate();
      const userId = interaction.user.id;
      await interaction.editReply({
        content: "Loading...",
        components: [],
      });
      // Execute the operations concurrently
      if (interaction.guild) {
        await Promise.all([
          deleteAllTeamsChannels(interaction),
          resetGeneralChannels(interaction),
          deleteAllRoles(interaction),
          clearAllRoles(interaction),
        ]);
      } else {
        throw new Error("This command can only be used in a guild.");
      }
      await interaction.editReply({
        content: "Doomsday reset done!",
        components: [],
      });
    } catch (error: any) {
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
  doomsday_cancel: async (interaction: ButtonInteraction) => {
    try {
      await interaction.update({
        content: "Doomsday command cancelled.",
        components: [], // Remove any buttons
      });
    } catch (error: any) {
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

const execute = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.member as GuildMember;
  if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
    return;
  }
  if (!interaction.channel || !('name' in interaction.channel) || interaction.channel.name !== "bot-cmd") {
    await interaction.reply({
      content: "This command can only be used in the #bot-cmd channel.",
      ephemeral: true,
    });
    return;
  }
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("doomsday_confirm")
      .setLabel("Yes")
      .setStyle(discord.ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("doomsday_cancel")
      .setLabel("Cancel")
      .setStyle(discord.ButtonStyle.Danger)
  );
  await interaction.reply({
    content:
      "Are you sure you want to initiate the Doomsday command? This will clear all channels and messages in the specified categories and cannot be undone.",
    components: [row],
    ephemeral: true,
  });
};

interface Command {
  data: ReturnType<SlashCommandBuilder['toJSON']>;
  buttons: ButtonHandlers;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  cooldown: number;
}

const command: Command = {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
  cooldown: 10,
};

export default command;