import { SlashCommandBuilder } from "@discordjs/builders";

const ADMIN_USER_IDS = ["75069008939847680", "75778454401847296"]; // Add your admin IDs here

const commandBuilder = new SlashCommandBuilder()
  .setName("aide")
  .setDescription("Envoyez une demande d'aide aux administrateurs.");

const execute = async (interaction) => {
  // Loop through the array of admin user IDs
  for (const adminId of ADMIN_USER_IDS) {
    try {
      // Get the admin user by ID
      const adminUser = await interaction.client.users.fetch(adminId);

      // Send a DM to the admin user
      await adminUser.send(
        `Demande d'aide de la part de <@${interaction.user.id}> in <#1052660022800293908>`
      );
    } catch (error) {
      console.error(
        `Impossible d'envoyer la demande d'aide à l'administrateur avec l'ID ${adminId}.`,
        error
      );
    }
  }

  // Reply to the user to confirm that the help request has been sent
  await interaction.reply({
    content: "Votre demande d'aide a été envoyée aux administrateurs.",
    ephemeral: true,
  });
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 60,
};
