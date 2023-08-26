import { SlashCommandBuilder } from "@discordjs/builders";
import { deleteApprovedChannel } from "../helpers/channelsManager.js";
import haq_database from "../supabase.js"; // Adjust this import to where your supabase client is initialized
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
} from "discord.js";

const cancelButton = new ButtonBuilder()
  .setCustomId("reject_cancel")
  .setLabel("Cancel")
  .setStyle(4);

const cancelRow = new ActionRowBuilder().addComponents(cancelButton);

const confirmButton = new ButtonBuilder()
  .setCustomId("reject_confirm")
  .setLabel("Confirm")
  .setStyle(1); // Primary button style

const buttonsRow = new ActionRowBuilder().addComponents(
  confirmButton,
  cancelButton
);

let selectMenuRow = null;

let selectedValues = [];

const commandBuilder = new SlashCommandBuilder()
  .setName("reject")
  .setDescription("Approve inscriptions.");

export const buttons = {
  reject_confirm: async (interaction) => {
    try {
      await interaction.deferUpdate();

      await interaction.editReply({
        content: "Loading...",
        components: [],
      });

      const selections = selectedValues.map((value) => JSON.parse(value));
      console.log("reject_confirm: - selections:", selections);

      if (selections.length === 0) {
        await interaction.editReply({
          content: "No inscription ID selected.",
        });
        return;
      }

      for (const elm of selections) {
      console.log("reject_confirm: - elm:", elm);

        const { error } = await haq_database
          .from("inscriptions")
          .update({ approved: false })
          .eq("id", elm.id);

        await deleteApprovedChannel(
          interaction.guild,
          elm.name,
          "1109480250108289124",
          "1080911803854356670"
        );

        if (error) {
          console.error("Error updating inscription:", error);
          hasErrorOccurred = true;
        }
      }

      await interaction.editReply({
        content: `The inscriptions have been successfully rejected.`,
        ephemeral: true,
        components: [],
      });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "There was an error creating the role. Please try again later."
      );
    }
  },

  reject_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

export const selectMenus = {
  reject_inscription: async (interaction) => {
    selectedValues = interaction.values;
    const namesArray = selectedValues.map((jsonString) => {
      const valueObject = JSON.parse(jsonString);
      return valueObject.name;
    });

    const namesString = namesArray.join(", ");

    await interaction.update({
      content: `Confirm the selection of the inscription **${namesString}** to reject`,
      components: [buttonsRow],
    });
  },
};

const execute = async (interaction) => {
  const { data: inscriptions, error } = await haq_database
    .from("inscriptions")
    .select("*")
    .eq("approved", true);

  if (inscriptions.length === 0) {
    await interaction.reply({
      content: "There are no inscriptions to reject.",
    });
    return;
  }

  const options = inscriptions
    .map((inscription) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(inscription.team_name)
        .setDescription(`ID: ${inscription.id}`)
        .setValue(
          JSON.stringify({
            id: inscription.id.toString(),
            name: inscription.team_name.toString(),
          })
        )
    )
    .slice(0, 25);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("reject_inscription")
    .setPlaceholder("Select an inscription to reject")
    .setMinValues(1)
    .setMaxValues(inscriptions.length)
    .addOptions(options);

  selectMenuRow = new ActionRowBuilder().addComponents(selectMenu);

  if (error) {
    console.error("Error fetching inscriptions:", error);
    await interaction.reply({
      content: "An error occurred while fetching the inscriptions.",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: "Select an inscription to reject:",
    components: [selectMenuRow, cancelRow],
  });
};

export default {
  data: commandBuilder.toJSON(),
  selectMenus,
  buttons,
  execute,
};
