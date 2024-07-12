import { SlashCommandBuilder } from "@discordjs/builders";
import discord, {
  ActionRowBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonInteraction,
  GuildMember,
  ChatInputCommandInteraction,
  EmbedBuilder
} from "discord.js";
import {
  handleTeamsChannels,
  handleGeneralChannels,
} from "../helpers/channelManager";
import { 
  handleRoles
} from "../helpers/roleManager";

interface ButtonHandlers {
  [key: string]: (interaction: ButtonInteraction) => Promise<void>;
}

export const buttons: ButtonHandlers = {
  doomsday_confirm: async (interaction: ButtonInteraction) => {
    try {
      await interaction.deferUpdate();
   
      const loadingEmbed = new EmbedBuilder()
      .setColor('#000000')
        .setTitle('Executing doomsday...')
        .setDescription(':robot:')
      
        await interaction.editReply({
          embeds: [loadingEmbed],
          components: [],
        });

      
      if (interaction.guild) {
        const results = await Promise.all([
          handleTeamsChannels(interaction),
          handleGeneralChannels(interaction),
          handleRoles(interaction),
        ]);
        
        const resultEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Doomsday done!')
          .setDescription('All actions were performed successfully.')

        await interaction.editReply({
          embeds: [resultEmbed],
          components: [],
        });
      } else {
        throw new Error("This command can only be used in a guild.");
      }
    } catch (error: any) {
      console.error("Error handling button: doomsday_confirm", error);
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
        components: [],
      });
    } catch (error: any) {
      console.error("Error handling button: doomsday_cancel", error);
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

  const deleteChannelsPreview = await handleTeamsChannels(interaction, true);
  const resetGeneralChannelsPreview = await handleGeneralChannels(interaction, true);
  const rolesPreview = await handleRoles(interaction, true);

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('Doomsday Contract')
    .setDescription('The following actions will be performed:')
    .addFields(
      { name: 'Teams Channels to be deleted', value: deleteChannelsPreview || 'None', inline: false },
      { name: 'Channels to be reset', value: resetGeneralChannelsPreview || 'None', inline: false },
      { name: 'Roles to be deleted', value: rolesPreview || 'None', inline: false },
    )
    .setFooter({ text: 'Do you agree to proceed with these actions?' });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("doomsday_confirm")
      .setLabel("Agree")
      .setStyle(discord.ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("doomsday_cancel")
      .setLabel("Cancel")
      .setStyle(discord.ButtonStyle.Secondary)
  );

  await interaction.reply({
    embeds: [embed],
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