// create a discord bot js simple ping command

import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

const commandBuilder = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply('Pong!!');
}

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 5,
};

// Path: src/commands/pong.js