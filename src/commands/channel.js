import { SlashCommandBuilder } from '@discordjs/builders';

const channelsCommand  = new SlashCommandBuilder()
.setName('echo')
.setDescription('Replies with your input!')
.addStringOption(option =>
  option.setName('input')
    .setDescription('The input to echo back'));

export default channelsCommand.toJSON();