import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ChannelType } from 'discord.js';
import supabaseModule from "../supabase.js";
const { live_tournament } = supabaseModule; // Adjust this import to where your supabase client is initialized
import { createRole } from "../helpers/roleManager.js";
import { createTeamChannel } from "../helpers/channelManager.js";

const cancelButton = new ButtonBuilder()
  .setCustomId("newteam_cancel")
  .setLabel("Cancel")
  .setStyle(4); // Danger style

const confirmButton = new ButtonBuilder()
  .setCustomId("newteam_confirm")
  .setLabel("Confirm")
  .setStyle(1); // Primary style

const buttonsRow = new ActionRowBuilder().addComponents(
  confirmButton,
  cancelButton
);

let selectMenuRow = null;
let selectedTeamName = "";

const commandBuilder = new SlashCommandBuilder()
  .setName("newteam")
  .setDescription("Create a new team.");

export const buttons = {
  newteam_confirm: async (interaction) => {
    try {
      await interaction.deferUpdate();

      await interaction.editReply({
        content: "Loading...",
        ephemeral: true,
        components: [],
      });

      if (!selectedTeamName) {
        await interaction.editReply({
          content: "No team selected.",
          ephemeral: true,
        });
        return;
      }

      const newTeam = await createTeam(interaction, selectedTeamName);
      if (newTeam) {
        await interaction.editReply({
          content: `Team **${newTeam.name}** created successfully!`,
          ephemeral: true,
          components: [],
        });
      } else {
        await interaction.editReply({
          content: "Team already exists.",
          ephemeral: true,
          components: [],
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "There was an error creating the team. Please try again later.",
        ephemeral: true,
      });
    }
  },

  newteam_cancel: async (interaction) => {
    try {
      await interaction.deferUpdate();
      await interaction.editReply({
        content: "Team creation has been cancelled.",
        components: [],
        ephemeral: true,
      });
    } catch (error) {
      if (error.code !== 10008) { // Ignore "Unknown Message" error
        console.error('Error handling button:', error);
      }
    }
  },
};

export const selectMenus = {
  select_team: async (interaction) => {
    selectedTeamName = interaction.values[0];
    console.log("Selected Team:", selectedTeamName);

    await interaction.update({
      content: `Confirm the selection of the team **${selectedTeamName}**.`,
      ephemeral: true,
      components: [buttonsRow],
    });
  },
};

const execute = async (interaction) => {
  const { data: teams, error } = await live_tournament
    .from("teams")
    .select("*");

  if (error) {
    console.error('Error fetching teams from Supabase:', error);
    await interaction.reply({
      content: "There was an error fetching the team list. Please try again later.",
      ephemeral: true,
    });
    return;
  }

  if (teams.length === 0) {
    await interaction.reply({
      content: "No teams available to select.",
      ephemeral: true,
    });
    return;
  }

  const options = teams
    .map((team) =>
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

  selectMenuRow = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: "Select a team to create:",
    ephemeral: true,
    components: [selectMenuRow, new ActionRowBuilder().addComponents(cancelButton)],
  });
};

const createTeam = async (interaction, teamName) => {
  const textCategoryId = '1247335698114023434'; // replace with your actual text category ID
  const voiceCategoryId = '1247335698114023435'; // replace with your actual voice category ID

  const teamRole = await createRole(interaction, teamName);
  if (!teamRole) {
    return null;
  }
  const textChannel = await createTeamChannel(interaction, textCategoryId, teamName, ChannelType.GuildText, teamRole);
  const voiceChannel = await createTeamChannel(interaction, voiceCategoryId, teamName, ChannelType.GuildVoice, teamRole);

  return {
    name: teamName,
    channel: textChannel,
    voiceChannel: voiceChannel,
    role: teamRole,
  };
};

export default {
  data: commandBuilder.toJSON(),
  selectMenus,
  buttons,
  execute,
};
