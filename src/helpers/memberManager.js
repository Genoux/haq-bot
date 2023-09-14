import supabaseModule from "../supabase.js";
const { haq_database } = supabaseModule; // Adjust this import to where your supabase client is initialized

export const newMember = async (member) => {
  const { data } = await haq_database
    .from("inscriptions")
    .select("team_name, players, coaches, substitutes, captain").eq('approved', true);
  
  for (const team of data) {
    
    const allMembers = [...team.players, ...team.coaches, ...team.substitutes];
    const matchingMember = allMembers.find((teamMember) =>
      teamMember.discord.toLowerCase() === member.user.username.toLowerCase()
    );
    
    const isCaptain = team.captain.toLowerCase() === member.user.username.toLowerCase();
    console.log("newMember - team.captain:", team.captain);
    
    if (matchingMember || isCaptain) {
      const normalizedTeamName = team.team_name.replace(/\s+/g, "").toLowerCase();

      const role = member.guild.roles.cache.find(
        (r) => r.name.replace(/\s+/g, "").toLowerCase() === normalizedTeamName
      );
      
      if (role) {
        member.roles.add(role).catch(console.error);
      }
      
      if (isCaptain) {
        const captainRole = member.guild.roles.cache.find((r) => r.name === 'Capitaine');
        if (captainRole) {
          member.roles.add(captainRole).catch(console.error);
        }
      }
      
      return;
    }
  }
};


export const newInscription = async () => {
  const { data } = await haq_database
    .from("inscriptions")
    .select("team_name, players, coaches, substitutes").eq('approved', true);
  
  const latestInscription = data[data.length - 1];

  if (!latestInscription) {
    console.log("No new inscriptions found.");
    return;
  }
};



