import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

const commandBuilder = new SlashCommandBuilder()
  .setName("deleteroles")
  .setDescription("Delete selected roles from the server.");

export const buttons = {
  deleteroles_confirm: async (interaction) => {
    await interaction.deferUpdate();

    await interaction.editReply({
      content: "Loading...",
      ephemeral: true,
      components: [],
    });

    await deleteRoles(interaction);

    await interaction.editReply({
      content: "Roles cleared successfully!",
      components: [],
      ephemeral: true,
    });
  },

  deleteroles_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

const execute = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("deleteroles_confirm")
      .setLabel("Yes")
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId("deleteroles_cancel")
      .setLabel("Cancel")
      .setStyle(4)
  );

  await interaction.reply({
    content:
      "Are you sure you want to delete all roles from the server? This action cannot be undone.",
    components: [row],
    ephemeral: true,
  });
};
export const deleteRoles = async (interaction) => {
  // The IDs of roles that we want to keep
  const rolesToKeep = [
    "465164174683537408",
    "465164636451504128",
    "1071176048785489925",
    "1141113852575100979",
    "465163371742756874",
  ];

  const rolesToDelete = interaction.guild.roles.cache.filter((role) => {
    return !rolesToKeep.includes(role.id);
  });

  for (const [roleId, role] of rolesToDelete) {
    try {
      await role.delete();
      console.log(`Deleted role ${role.name}`);
    } catch (error) {
      console.error(`Failed to delete role ${roleId}: `, error);
    }
  }
};

export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
  cooldown: 10,
};
