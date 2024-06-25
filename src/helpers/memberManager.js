import supabaseModule from "../supabase.js";
const { live_tournament } = supabaseModule;

// TODO: Clean up this function

export const newMember = async (member) => {
  const { data } = await live_tournament.from("teams").select("*");

  for (const team of data) {
    const allMembers = [...team.players, ...team.coaches, ...team.substitutes];
    const matchingMember = allMembers.find((teamMember) => {
      teamMember.discord.toLowerCase() === member.user.username.toLowerCase();
    });

    if (matchingMember) {
      const normalizedTeamName = team.name.replace(/\s+/g, "").toLowerCase();

      const role = member.guild.roles.cache.find(
        (r) => r.name.replace(/\s+/g, "").toLowerCase() === normalizedTeamName
      );

      if (!role) {
        console.log("newMember - role not found:", normalizedTeamName);
        return;
      }

      member.roles.add(role).catch(console.error);

      const isCaptain =
        team.players[0].discord.toLowerCase() ===
        member.user.username.toLowerCase();

      if (isCaptain) {
        const captainRole = member.guild.roles.cache.find(
          (r) => r.name === "Capitaine"
        );
        if (captainRole) {
          member.roles.add(captainRole).catch(console.error);
        }
      }

      return;
    }
  }
};
