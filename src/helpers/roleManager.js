// This function creates a role with the given name and color in the specified guild
async function createRole(guild, roleName) {
  try {
    // Check if a role with the specified roleName already exists in the guild
    const existingRole = guild.roles.cache.find(role => role.name === roleName);

    if (existingRole) {
      console.log('Role already exists:', existingRole.name);
      return existingRole;
    }

    const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
    console.log("createRole - color:", color);

    const newRole = await guild.roles.create({
      name: roleName,
      color: color,
      hoist: true
    });
    
    console.log('New role created:', newRole.name);
    return newRole;

  } catch (error) {
    // If there was an error, log it and throw it
    console.error(error);
    throw new Error('There was an error creating the role.');
  }
}

async function deleteRole(guild, roleName) {
  try {
    // Find the role by name in the guild's role cache
    const roleToDelete = guild.roles.cache.find(role => role.name === roleName);

    // If the role exists, attempt to delete it
    if (roleToDelete) {
      await roleToDelete.delete();
      console.log('Role has been deleted:', roleName);
    } else {
      console.log('Role not found:', roleName);
    }

  } catch (error) {
    // If there was an error, log it and throw it
    console.error('There was an error deleting the role:', error);
    throw new Error('There was an error deleting the role.');
  }
}

export { createRole, deleteRole };
