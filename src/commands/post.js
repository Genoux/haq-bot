import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

const commandBuilder = new SlashCommandBuilder()
  .setName('post_tournament_info')
  .setDescription('Post tournament information to a specific channel')
  .setDefaultMemberPermissions(0)

const execute = async (interaction) => {

  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    await interaction.reply('You do not have permission to use this command.');
    return;
  }
  // Replace 'your-channel-id' with the actual channel ID where you want to post the message
  const channelId = '1252755989954822215';
  const channel = interaction.guild.channels.cache.get(channelId);

  if (!channel) {
    await interaction.reply('Channel not found.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#dcfc35')
    .setTitle('Informations sur le tournoi')
    .setDescription(
      `**Bonjour à toutes et à tous, veuillez prendre connaissance du fonctionnement du tournoi ci-dessous.**

      _Capitaines, connectez-vous à 18h sur le channel ⁠Info pour un rappel des règles. Merci à toutes et à tous._

**Format**

Double élimination avec winner et loser bracket. Demi-finales et finale en BO3, autres matchs en BO1.
L’arbre de tournoi sera envoyé dans __**#horaire**__. L'équipe du haut sera toujours du côté bleu. Pour les BO3, le côté change à chaque partie.

**Règles générales**

- À chaque fin de partie, envoyez une capture d’écran des résultats sur le channel __**#résultats**__.
- Un retard de 15 minutes sera toléré entre chaque partie. Au-delà, l'équipe en retard sera disqualifiée. L'équipe adverse doit en informer les admins.
- Les capitaines et leurs équipes doivent suivre l'évolution des matchs et créer les lobbys. Les capitaines sont identifiés en jaune sur le channel.
- Les lobbys seront en mode ARAM blind pick. Choisissez les champions sélectionnés lors de la draft. En cas d'erreur, l'équipe fautive sera disqualifiée.
- Les échanges entre équipes sont encouragés, mais la diffamation est interdite. Signalez toute infraction avec une capture d’écran.

**Draft**

- Utilisez le site de draft personnalisé via le lien : https://draft.tournoishaq.ca/
- La draft fonctionne comme _prodraft_. Générez des liens pour vous, l'équipe adverse et les spectateurs. Suivez l’arbre de tournoi pour les sides.
- Un pool de 30 champions sera présenté. Vous aurez 3 minutes pour discuter avant la draft officielle.
- Après la planification, chaque équipe effectue 3 bans (blue side first ban).
- Ensuite, la phase de pick commence (blue side first pick).
- Après la draft, sélectionnez les champions choisis dans le lobby. Une équipe sélectionnant un champion non drafté sera disqualifiée.
- En cas exceptionnel où un joueur ne posséderait aucun champion drafté, un redo est possible.

Sur ce, HAQ vous souhaite un bon tournoi! Pour toute question, vous pouvez @host suivi de votre question dans le channel de votre équipe, et nous vous répondrons dès que possible.`
    )
    .setFooter({ text: 'HAQ Tournoi' });

  await channel.send({ embeds: [embed] });
  await interaction.reply('Tournament information posted successfully.');
}

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 5,
};
