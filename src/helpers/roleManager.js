// This function creates a role with the given name and color in the specified guild
async function createRole(guild, roleName, color = 'FF0000') {
  try {
      const newRole = await guild.roles.create({
          name: roleName,
          color: color,
      });
      
      // Return the new role object
      return newRole;
  } catch (error) {
      // If there was an error, log it and throw it
      console.error(error);
      throw new Error('There was an error creating the role.');
  }
}


export { createRole };
