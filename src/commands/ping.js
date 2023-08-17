// In a file named `ping.js`
import { SlashCommandBuilder } from '@discordjs/builders';

const commandBuilder = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

const execute = async (interaction) => {
  await interaction.reply('Pong!');
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 10
};