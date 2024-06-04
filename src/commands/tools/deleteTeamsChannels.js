export const deletechannels = async (interaction) => {
  try {
    // The ID of the desired category (sub-dropdown)
    const categoryIds = ["1247335698114023434", "1247335698114023435"];

    for (const categoryId of categoryIds) {
      // Get the category channel by its ID
      const category = interaction.guild.channels.cache.get(categoryId);

      if (!category) {
        console.log(`Category with ID ${categoryId} not found!`);
        continue; 
      }

   

      // Filter channels that have this category as their parent
      const channels = interaction.guild.channels.cache.filter(
        (ch) => ch.parentId === categoryId
      );

      if (channels.length === 0) {
        console.log(`No channels found in category ${category.name}`);
        return;
      }

      // Iterate through the channels and delete them
      for (const [index, channel] of channels.entries()) { 
        console.log(`Deleting channel with Index: ${index}, Name: ${channel.name}`);  

        // Delete the channel
        await channel.delete().catch(console.error);
      }
    }
  } catch (error) { 
    console.error("Error in cleartags:", error);
  }
};