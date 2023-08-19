import supabase from "../supabase.js"; // Adjust this import to where your supabase client is initialized
export const newMember = async (member) => {
    const { data } = await supabase
        .from("inscriptions")
        .select("team_name, players, coaches, substitutes, captain").eq('approved', true);
    // Loop through each team
    for (const team of data) {
        console.log("newMember - team:", team);
        // Combine players, coaches, and substitutes into a single array
        const allMembers = [...team.players, ...team.coaches, ...team.substitutes];
        // Find a member in allMembers whose discord field matches member.user.username
        const matchingMember = allMembers.find((teamMember) => teamMember.discord.toLowerCase() === member.user.username.toLowerCase());
        // Check if the captain's discord username matches the member's discord username
        const isCaptain = team.captain.toLowerCase() === member.user.username.toLowerCase();
        console.log("newMember - team.captain:", team.captain);
        // If a matching member was found or if the member is a captain
        if (matchingMember || isCaptain) {
            // Normalize the team name
            const normalizedTeamName = team.team_name.replace(/\s+/g, "").toLowerCase();
            // Find the matching role
            const role = member.guild.roles.cache.find((r) => r.name.replace(/\s+/g, "").toLowerCase() === normalizedTeamName);
            // If the role was found, assign it to the member
            if (role) {
                member.roles.add(role).catch(console.error);
            }
            // If the member is a captain, assign the Captain role
            if (isCaptain) {
                const captainRole = member.guild.roles.cache.find((r) => r.name === 'Capitaine');
                if (captainRole) {
                    member.roles.add(captainRole).catch(console.error);
                }
            }
            // A match was found, so we can return early and exit the function
            return;
        }
    }
    // If no match was found in allMembers and the member is not a captain,
    // the function will reach this point and simply exit without doing anything.
};
