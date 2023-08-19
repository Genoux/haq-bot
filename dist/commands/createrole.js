import { SlashCommandBuilder } from '@discordjs/builders';
import { createRole } from '../helpers/roleManager.js'; // Adjust the path as needed
const commandBuilder = new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Create a new role')
    .addStringOption(option => option.setName('name')
    .setDescription('The name of the role to create')
    .setRequired(true));
const execute = async (interaction) => {
    const roleName = interaction.options.getString('name');
    try {
        const newRole = await createRole(interaction.guild, roleName);
        await interaction.reply(`Role **${newRole.name}** created successfully!`);
    }
    catch (error) {
        console.error(error);
        await interaction.reply('There was an error creating the role. Please try again later.');
    }
};
export default {
    data: commandBuilder.toJSON(),
    execute,
    cooldown: 10
};
