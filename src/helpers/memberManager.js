import haq_database from "../supabase.js"; // Adjust this import to where your supabase client is initialized

export const newMember = async (member) => {
  const { data } = await haq_database
    .from("inscriptions")
    .select("team_name, players, coaches, substitutes, captain").eq('approved', true);
  
  // Loop through each team
  for (const team of data) {
    console.log("newMember - team:", team);
    
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
  
  // Assuming you want to display data for the latest inscription, 
  // you can take the last item from the data array.
  const latestInscription = data[data.length - 1];

  if (!latestInscription) {
    console.log("No new inscriptions found.");
    return;
  }

  console.log("Team Name:", latestInscription.team_name);
  console.log("Players:", latestInscription.players.map(player => player.discord).join(', '));
  console.log("Coaches:", latestInscription.coaches.map(coach => coach.discord).join(', '));
  console.log("Substitutes:", latestInscription.substitutes.map(substitute => substitute.discord).join(', '));
};



