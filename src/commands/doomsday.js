import { SlashCommandBuilder } from "@discordjs/builders";
import discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
} from "discord.js";
import { resetchannels } from "./resetchannels.js";
import { cleartags } from "./cleartags.js";
const { MessageActionRow, MessageButton } = discord;

export const buttons = {
  doomsday_confirm: async (interaction) => {
    await doomsday(interaction);
    await resetchannels(interaction);
    await cleartags(interaction);
  },
  doomsday_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

const commandBuilder = new SlashCommandBuilder()
  .setName("doomsday")
  .setDescription("The last day of the world's existence.");

const execute = async (interaction) => {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply("This command can only be used in a server.");
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

  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content:
        "Are you sure you want to initiate the Doomsday command? This will clear all channels and messages in the specified categories and cannot be undone.",
      components: [row],
    });
  }
};

const doomsday = async (interaction) => {
  const categoryId = ["1141068228324499556"];

  let categoryChannels = interaction.guild.channels.cache.filter(
    (c) => c.parentId == categoryId
  );

  if (!categoryChannels) {
    throw new Error(`Category with ID ${categoryId} not found!`);
  }

  categoryChannels.forEach(async (channel) => {
    if (channel.type === ChannelType.GuildText) {
      // Clone the channel
      const newChannel = await channel.clone().catch(console.error);

      // Delete the old channel
      await channel.delete().catch(console.error);

      // Optionally: You might want to set the position of the new channel to match the old one
      if (newChannel) {
        await newChannel.setPosition(channel.position).catch(console.error);
      }
    }
  });

  await interaction.update({
    content: "Doomsday reset done!",
    components: [],
  });
};

export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
};
