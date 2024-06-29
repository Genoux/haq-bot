/**
 * Creates a role with the given name and color in the specified guild
 * @param {*} interaction
 * @param {*} roleName
 *
 */
async function createRole(interaction, roleName) {
  try {
    // Check if a role with the specified roleName already exists in the guild
    const existingRole = interaction.guild.roles.cache.find(
      (role) => role.name === roleName
    );

    if (existingRole) {
      console.log("Role already exists:", existingRole.name);
      return null;
    }

    const color = "#" + Math.floor(Math.random() * 0xffffff).toString(16);

    const newRole = await interaction.guild.roles.create({
      name: roleName,
      color: color,
      hoist: true,
    });

    console.log("New role created:", newRole.name);
    return newRole;
  } catch (error) {
    // If there was an error, log it and throw it
    console.error(error);
    throw new Error("There was an error creating the role.");
  }
}

/**
 * Deletes all roles in the specified guild
 * @param {*} interaction
 *
 */
async function deleteAllRoles(interaction) {
  try {
    // The IDs of roles that we want to keep
    const rolesToKeep = ["Mod", "Hosts", "haq-bot", "@everyone", "Capitaine"];

    const rolesToDelete = interaction.guild.roles.cache.filter((role) => {
      return !rolesToKeep.includes(role.name);
    });

    for (const [roleId, role] of rolesToDelete) {
      try {
        await role.delete();
        console.log(`Deleted role ${role.name}`);
      } catch (error) {
        console.error(`Failed to delete role ${role.name}: `, error);
      }
    }
  } catch (error) {
    // If there was an error, log it and throw it
    console.error("There was an error deleting the role:", error);
    throw new Error("There was an error deleting the role.");
  }
}

/**
 * Clear all roles on each user of the guild
 * @param {*} interaction
 *
 */
const clearAllRoles = async (interaction) => {
  const exemptRoles = ["Mod", "Hosts", "haq-bot"];

  const members = await interaction.guild.members.fetch();
  try {
    const everyoneRole = interaction.guild.id; // @everyone role ID is equal to guild ID

    members.forEach(async (member) => {
      const userRoles = member.roles.cache.filter((role) => {
        return role.id !== everyoneRole && !exemptRoles.includes(role.name);
      });

      await member.roles.remove(userRoles).catch(console.error);
    });
  } catch (error) {
    console.error("Error in cleartags:", error);
  }
};

export { createRole, deleteAllRoles, clearAllRoles };
