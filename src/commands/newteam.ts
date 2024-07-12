import { SlashCommandBuilder } from '@discordjs/builders';
import { 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  StringSelectMenuOptionBuilder, 
  ButtonBuilder, 
  ChannelType,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ChatInputCommandInteraction,
  ButtonStyle,
  Role,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import supabaseModule from "../supabase";
import { createRole } from "../helpers/roleManager";
import { createTeamChannel } from "../helpers/channelManager";

const { supabase } = supabaseModule;

const cancelButton = new ButtonBuilder()
  .setCustomId("newteam_cancel")
  .setLabel("Cancel")
  .setStyle(ButtonStyle.Danger);

const confirmButton = new ButtonBuilder()
  .setCustomId("newteam_confirm")
  .setLabel("Confirm")
  .setStyle(ButtonStyle.Primary);

const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  confirmButton,
  cancelButton
);

let selectMenuRow: ActionRowBuilder<StringSelectMenuBuilder> | null = null;
let selectedTeamName: string = "";

const commandBuilder = new SlashCommandBuilder()
  .setName("newteam")
  .setDescription("Create a new team.")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

interface ButtonHandlers {
  [key: string]: (interaction: ButtonInteraction) => Promise<void>;
}

export const buttons: ButtonHandlers = {
  newteam_confirm: async (interaction: ButtonInteraction) => {
    try {
      await interaction.deferUpdate();

      await interaction.editReply({
        content: "Loading...",
        components: [],
      });

      if (!selectedTeamName) {
        await interaction.editReply({
          content: "No team selected.",
        });
        return;
      }

      const newTeam = await createTeam(interaction, selectedTeamName);
      if (newTeam) {
        await interaction.editReply({
          content: `Team **${newTeam.name}** created successfully!`,
          components: [],
        });
      } else {
        await interaction.editReply({
          content: "Team already exists.",
          components: [],
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "There was an error creating the team. Please try again later.",
      });
    }
  },

  newteam_cancel: async (interaction: ButtonInteraction) => {
    try {
      await interaction.deferUpdate();
      await interaction.editReply({
        content: "Team creation has been cancelled.",
        components: [],
      });
    } catch (error: any) {
      if (error.code !== 10008) { // Ignore "Unknown Message" error
        console.error('Error handling button:', error);
      }
    }
  },
};

interface SelectMenuHandlers {
  [key: string]: (interaction: StringSelectMenuInteraction) => Promise<void>;
}

export const selectMenus: SelectMenuHandlers = {
  select_team: async (interaction: StringSelectMenuInteraction) => {
    selectedTeamName = interaction.values[0];

    await interaction.update({
      content: `Confirm the selection of the team **${selectedTeamName}**.`,
      components: [buttonsRow],
    });
  },
};

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true
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

  const { data: teams, error } = await supabase
    .from("registrations")
    .select("*");

  if (error) {
    console.error('Error fetching teams from Supabase:', error);
    await interaction.reply({
      content: "There was an error fetching the team list. Please try again later.",
      ephemeral: true,
    });
    return;
  }

  if (!teams || teams.length === 0) {
    await interaction.reply({
      content: "No teams available to select.",
      ephemeral: true,
    });
    return;
  }

  const options = teams
    .map((team: { name: string }) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(team.name)
        .setValue(team.name)
    )
    .slice(0, 25);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("select_team")
    .setPlaceholder("Select a team to create")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options);

  selectMenuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  await interaction.reply({
    content: "Select a team to create:",
    ephemeral: true,
    components: [selectMenuRow, new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton)],
  });
};

interface Team {
  name: string;
  channel: TextChannel;
  voiceChannel: VoiceChannel;
  role: Role;
}

const createTeam = async (interaction: ButtonInteraction, teamName: string): Promise<Team | null> => {
  const teamRole = await createRole(interaction, teamName);
  if (!teamRole) {
    return null;
  }
  const textChannel = await createTeamChannel(interaction, 'Text Channels', teamName, ChannelType.GuildText, teamRole);
  const voiceChannel = await createTeamChannel(interaction, 'Voice Channels', teamName, ChannelType.GuildVoice, teamRole);

  if (!textChannel || !voiceChannel) {
    return null;
  }

  return {
    name: teamName,
    channel: textChannel as TextChannel,
    voiceChannel: voiceChannel as VoiceChannel,
    role: teamRole,
  };
};

export default {
  data: commandBuilder.toJSON(),
  selectMenus,
  buttons,
  execute,
};