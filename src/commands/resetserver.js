import { SlashCommandBuilder } from '@discordjs/builders';
import discord, { ActionRowBuilder, ButtonBuilder } from 'discord.js';
const { MessageActionRow, MessageButton } = discord;



export const buttons = {
  'reset_confirm': async (interaction) => {
    await resetserver(interaction);

    await interaction.message.delete();
      // Handle the reset confirmation button click
  },
  'reset_cancel': async (interaction) => {
    await interaction.message.delete();
      // Handle the reset cancellation button click
  }
};

const commandBuilder = new SlashCommandBuilder()
    .setName('resetserver')
    .setDescription('Resets various server settings, including renaming channels.');

    const execute = async (interaction) => {
      const guild = interaction.guild;
      if (!guild) {
          await interaction.reply("This command can only be used in a server.");
          return;
      }

      const row = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('reset_confirm')
                  .setLabel('Yes')
                  .setStyle(1),
              new ButtonBuilder()
                  .setCustomId('reset_cancel')
                  .setLabel('Cancel')
                  .setStyle(4)
          );
  
      await interaction.reply({
          content: 'Are you sure you want to reset server settings?',
        components: [row]
      });
  };

  const resetserver = async (interaction) => {
    // The ID of the desired category (sub-dropdown)
    const categoryId = '1080911803854356670';

    const category = interaction.guild.channels.cache.get(categoryId);
    
    if (category && category.type === 'GUILD_CATEGORY') {
        const voiceChannelsInCategory = category.children.filter(ch => ch.type === 'GUILD_VOICE');
        console.log(voiceChannelsInCategory);
    } else {
        console.log('Category not found or is not a valid category.');
    }
    
    // Filter voice channels within the specific category
    const voiceChannels = interaction.guild.channels.cache.filter(ch => 
        ch.type === 'GUILD_VOICE' && ch.parent.id === categoryId
    );
  //  console.log("resetserver - voiceChannels:", voiceChannels);

    let counter = 1;

    for (const channel of voiceChannels.values()) {
        console.log("resetserver - channel:", channel);
        // await channel.setName(`Team ${counter}`);
        counter++;
    }

    // Add more reset functionalities here as needed...

    await interaction.update({ content: 'Server settings reset successfully!', components: [] });
};



export default {
  data: commandBuilder.toJSON(),
  buttons,
  execute,
};
