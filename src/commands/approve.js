import { SlashCommandBuilder } from "@discordjs/builders";
import supabase from "../supabase.js"; // Adjust this import to where your supabase client is initialized
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
} from "discord.js";

const cancelButton = new ButtonBuilder()
  .setCustomId("approve_cancel")
  .setLabel("Cancel")
  .setStyle(4);

const confirmButton = new ButtonBuilder()
  .setCustomId("approve_confirm")
  .setLabel("Confirm")
  .setStyle(1); // Primary button style

const buttonsRow = new ActionRowBuilder().addComponents(
  confirmButton,
  cancelButton
);

let selectMenuRow = null;

let selectedValues = [];

const commandBuilder = new SlashCommandBuilder()
  .setName("approve")
  .setDescription("Approve inscriptions.");

export const buttons = {
  approve_confirm: async (interaction) => {
    const selections = selectedValues.map((value) => JSON.parse(value));

    if (selections.length === 0) {
      await interaction.reply({
        content: "No inscription ID selected.",
        ephemeral: true,
      });
      return;
    }

    let hasErrorOccurred = false;

    for (const elm of selections) {
      console.log("approve_confirm: - elm:", elm);
      const { error } = await supabase
        .from("inscriptions")
        .update({ approved: true })
        .eq("id", elm.id);

      if (error) {
        console.error("Error updating inscription:", error);
        hasErrorOccurred = true;
      }
    }

    // Send a single update after all updates are attempted
    if (hasErrorOccurred) {
      await interaction.update({
        content: `An error occurred while approving the inscription.`,
        ephemeral: true,
        components: [], // This removes all components from the message
      });
    } else {
      await interaction.update({
        content: `The inscriptions have been successfully approved.`,
        ephemeral: true,
        components: [], // This removes all components from the message
      });
    }
  },

  approve_cancel: async (interaction) => {
    await interaction.message.delete();
  },
};

export const selectMenus = {
  approve_inscription: async (interaction) => {
    selectedValues = interaction.values;

    // Parse each JSON-formatted string in the selectedValues array,
    // and then extract the 'name' property of each parsed object
    const namesArray = selectedValues.map((jsonString) => {
      const valueObject = JSON.parse(jsonString);
      return valueObject.name;
    });

    console.log("'approve_inscription': - namesArray:", namesArray);

    // You can join the namesArray to form a single string if needed
    const namesString = namesArray.join(", ");

    await interaction.update({
      content: `Confirm the selection of the inscription **${namesString}**.`,
      ephemeral: true,
      components: [selectMenuRow, buttonsRow],
    });

    //interaction.deferUpdate()
    // return
    // Do nothing when the select menu is used.
    // Wait for the user to press the "Confirm" button to process the selection.
  },
};

// export const selectMenus = {
//   'approve_inscription': async (interaction) => {
//     await interaction.deferUpdate();
//     // console.log("approve_inscription: - interaction:", interaction);
//     // const inscriptionId = interaction.values[0];

//     // const { error } = await supabase
//     //   .from('inscriptions')
//     //   .update({ approved: true })
//     //   .eq('id', inscriptionId);

//     // if (error) {
//     //   console.error("Error updating inscription:", error);
//     //   await interaction.update({ content: "An error occurred while approving the inscription.", ephemeral: true });
//     // } else {
//     //   await interaction.update({ content: "The inscription has been successfully approved.", ephemeral: true,  components: [] });
//     // }
//   }
// };

const execute = async (interaction) => {
  const { data: inscriptions, error } = await supabase
    .from("inscriptions")
    .select("*")
    .eq("approved", false);
  console.log("inscriptions:", inscriptions);

  if (inscriptions.length === 0) {
    await interaction.reply({
      content: "There are no inscriptions to approve.",
      ephemeral: true,
    });
    return;
  }

  const options = inscriptions.map((inscription) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(inscription.team_name)
      .setDescription(`ID: ${inscription.id}`)
      .setValue(
        JSON.stringify({
          id: inscription.id.toString(),
          name: inscription.team_name.toString(),
        })
      )
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("approve_inscription")
    .setPlaceholder("Select an inscription to approve")
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
    content: "Select an inscription to approve:",
    components: [selectMenuRow, buttonsRow],
  });
};

export default {
  data: commandBuilder.toJSON(),
  selectMenus,
  buttons,
  execute,
};
