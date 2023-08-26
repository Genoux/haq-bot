import { config } from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { client } from "../index.js";
import { EmbedBuilder } from "discord.js";
import { createDraftDoneEmbed } from "./embedManager.js";

config();

const app = express();
const PORT = 3002; // Choose an appropriate port

app.use(bodyParser.json());

app.post("/webhook-endpoint", async (req, res) => {
  const payload = req.body;

  if (process.env.DISCORD_WEBHOOK === "false") {
    res.status(200).send("Webhook disabled");
    return;
  }

  const embed = createDraftDoneEmbed(payload.data);

  const channel = client.channels.cache.find((ch) => ch.name === "bot-test");
  if (channel) {
    // channel.send(payload.data.blue.name.toString());
    channel.send({ embeds: [embed] });
  }

  res.status(200).send({ success: true });
});

export function startWebhookServer() {
  app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
  });
}
