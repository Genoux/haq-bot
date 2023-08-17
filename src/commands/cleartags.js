import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export const buttons = {
  cleartags_confirm: async (interaction) => {
    await interaction.deferUpdate();

    await interaction.editReply({
      content: "Loading...",
      components: [],
    });

    await cleartags(interaction);

    await interaction.editReply({
      content:
        "User roles have been cleared, except for 'Moderator' and 'Host' roles.",
      components: [],
    });
  },
  cleartags_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("cleartags")
  .setDescription(
    "Removes all user roles except for those with a 'Moderator' or 'Host' role."
  );

const execute = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cleartags_confirm")
      .setLabel("Yes")
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId("cleartags_cancel")
      .setLabel("Cancel")
      .setStyle(4)
  );

  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content:
        "Are you sure you want to execute the `cleartags` command? This will remove all roles from users, except for those with a 'Moderator' or 'Host' role. This action cannot be undone.",
      components: [row],
    });
  }
};

export const cleartags = async (interaction) => {
  const exemptRoles = ["Mod", "Hosts", "haq-bot"];

  const members = await interaction.guild.members.fetch();
  try {
    const everyoneRole = interaction.guild.id; // @everyone role ID is equal to guild ID

    members.forEach(async (member) => {
      const userRoles = member.roles.cache.filter((role) => {
        return role.id !== everyoneRole && !exemptRoles.includes(role.name);
      });

      await member.roles.remove(userRoles).catch(console.error);
    });
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
