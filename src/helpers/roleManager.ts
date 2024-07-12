import { Interaction, Role, ColorResolvable } from 'discord.js';

export const handleRoles = async (interaction: Interaction, previewOnly: boolean = false): Promise<string> => {
  const rolesToKeep = ["Mod", "Hosts", "haq-bot", "@everyone"];
  const rolesToClearOnly = ["Capitaine"];
  let result = "";
  
  const rolesToHandle = interaction.guild!.roles.cache.filter(role => 
    !rolesToKeep.includes(role.name) && role.name !== "@everyone"
  );

  if (rolesToHandle.size === 0) {
    return "None";
  }

  for (const [roleId, role] of rolesToHandle) {
    const action = rolesToClearOnly.includes(role.name) ? 'clear' : 'delete';

    if (!previewOnly) {
      if (action === 'delete') {
        try {
          await role.delete();
        } catch (error) {
          console.error(`Failed to delete role ${role.name}: `, error);
        }
      } else {
        const members = await interaction.guild!.members.fetch();
        for (const [memberId, member] of members) {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role).catch(console.error);
          }
        }
      }
    }
  }

  return result.trim();
};

export async function createRole(interaction: Interaction, roleName: string): Promise<Role | null> {
  if (!interaction.guild) {
    throw new Error("Interaction must be in a guild");
  }
  try {
    const existingRole = interaction.guild.roles.cache.find(
      (role) => role.name === roleName
    );
    if (existingRole) {
      console.log("Role already exists:", existingRole.name);
      return null;
    }
    const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    const newRole = await interaction.guild.roles.create({
      name: roleName,
      color: color as ColorResolvable,
      hoist: true,
    });
    console.log("New role created:", newRole.name);
    return newRole;
  } catch (error) {
    console.error(error);
    throw new Error("There was an error creating the role.");
  }
}