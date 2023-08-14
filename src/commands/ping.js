import { SlashCommandBuilder } from '@discordjs/builders';

const commandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with your input!')

const execute = async (interaction) => {
    interaction.reply('pong!').catch(console.error);
};

export default {
    data: commandBuilder.toJSON(),
    execute,
};