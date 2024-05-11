// In a file named `purge.js`
import { SlashCommandBuilder } from "@discordjs/builders";

const commandBuilder = new SlashCommandBuilder()
  .setName("purge")
  .setDescription(
    "Deletes the maximum allowed number of messages from the current channel"
  );

const execute = async (interaction) => {
  interaction.channel.messages
    .fetch({ limit: 99 })
    .then((messages) => {
      const deletable = messages.filter((msg) => !msg.pinned && !msg.system);

      return interaction.channel.bulkDelete(deletable, true).then((deleted) => {
        const oldestMessage = messages.last();
        if (!oldestMessage) return;
        return oldestMessage.delete();
      });
    })
    .then(() => {
      interaction.reply({
        content: "Deleted some messages.",
        ephemeral: true,
      });
    })
    .catch((err) => {
      console.error(err);
      interaction.reply({
        content: "There was an error trying to prune messages in this channel.",
        ephemeral: true,
      });
    });
};

export default {
  data: commandBuilder.toJSON(),
  execute,
  cooldown: 0,
};
