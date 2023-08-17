// In a file named `ping.js`
import { SlashCommandBuilder } from '@discordjs/builders';

const commandData = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

const execute = async (interaction) => {
  await interaction.reply('Pong!');
};

export default {
  data: commandData.toJSON(),
  execute,
  cooldown: 10
};