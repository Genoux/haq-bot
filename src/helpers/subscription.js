import supabaseModule from "../supabase.js";
const { haq_database, draft_database } = supabaseModule;
import { createDraftDoneEmbed, createTeamEmbed } from "./embedManager.js";

export const subscribe = async (client) => {
  const notificationsChannel = client.channels.cache.find(
    (ch) => ch.name === "notifications"
  );

  const inscriptionsChannel  = client.channels.cache.find(
    (ch) => ch.name === "inscriptions"
  );

if (process.env.DRAFT_WEBHOOK === "true") {
  draft_database
    .channel("*")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
      },
      async ({ new: payload }) => {
        console.log("payload:", payload);
        // Create an embed from the payload
        if (payload.status === "done") {
          const { data: teams } = await draftDB
            .from("teams")
            .select("*")
            .eq("room", payload.id);
          const teamReduce = teams.reduce((acc, curr) => {
            acc[curr.color] = curr;
            return acc;
          }, {});
          const teamEmbed = createDraftDoneEmbed(teamReduce);
          notificationsChannel.send({ embeds: [teamEmbed] });
        }
      }
    )
    .subscribe((status, err) => {
      if (!err) {
        console.log("Subbed to database draft pick", status);
      } else {
        console.log(err);
      }
    });
  }

  haq_database
    .channel("*")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inscriptions",
      },
      ({ new: payload }) => {
        // Create an embed from the payload
        const teamEmbed = createTeamEmbed(payload);

        // Send the embed to the channel
        inscriptionsChannel.send({ embeds: [teamEmbed] });
      }
    )
    .subscribe((status, err) => {
      if (!err) {
        console.log("Subbed to database", status);
      } else {
        console.log(err);
      }
    });
}