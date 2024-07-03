import { Interaction, Role, ColorResolvable } from 'discord.js';

export const handleRoles = async (interaction: Interaction, previewOnly: boolean = false): Promise<string> => {
  const rolesToKeep = ["Mod", "Hosts", "haq-bot", "@everyone"];
  const rolesToClearOnly = ["Capitaine"];
  let result = "";
  const members = await interaction.guild!.members.fetch();

  const rolesToHandle = new Map<string, { action: 'delete' | 'clear', users: Set<string> }>();

  interaction.guild!.roles.cache.forEach((role) => {
    if (!rolesToKeep.includes(role.name)) {
      rolesToHandle.set(role.name, {
        action: rolesToClearOnly.includes(role.name) ? 'clear' : 'delete',
        users: new Set()
      });
    }
  });

  for (const [memberId, member] of members) {
    const userRoles = member.roles.cache.filter((role) =>
      rolesToHandle.has(role.name)
    );

    userRoles.forEach(role => {
      rolesToHandle.get(role.name)!.users.add(member.user.username);
    });

    if (!previewOnly) {
      await member.roles.remove(userRoles).catch(console.error);
    }
  }

  for (const [roleName, { action, users }] of rolesToHandle) {
    const userCount = users.size;

    if (userCount === 0) {
      result += ``;
    } else if (userCount <= 3) {
      result += `- ${roleName} (to be removed from ${Array.from(users).join(', ')})\n`;
    } else {
      const sampleUsers = Array.from(users).slice(0, 2);
      result += `- ${roleName} (to be removed from ${sampleUsers.join(', ')} and ${userCount - 2} others)\n`;
    }

    if (!previewOnly && action === 'delete') {
      try {
        await interaction.guild!.roles.cache.find(r => r.name === roleName)?.delete();
      } catch (error) {
        console.error(`Failed to delete role ${roleName}: `, error);
      }
    }
  }

  return result;
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