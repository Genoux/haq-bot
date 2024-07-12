import { 
  PermissionsBitField, 
  ChannelType, 
  Guild, 
  CategoryChannel,
  TextChannel,
  VoiceChannel,
  Role,
  Interaction
} from "discord.js";

const getCategoryByName = (guild: Guild, categoryName: string): CategoryChannel | undefined => {
  return guild.channels.cache.find(
    channel => channel.type === ChannelType.GuildCategory && channel.name === categoryName
  ) as CategoryChannel | undefined;
};

export const handleTeamsChannels = async (interaction: Interaction, previewOnly: boolean = false): Promise<string> => {
  const categoryNames = ["Text Channels", "Voice Channels"];
  let result = "";

  for (const categoryName of categoryNames) {
    const category = getCategoryByName(interaction.guild!, categoryName);
    if (!category) continue;

    result += `${categoryName}:\n`;

    const channels = interaction.guild!.channels.cache
      .filter((ch): ch is TextChannel | VoiceChannel => ch.parentId === category.id && 'position' in ch)
      .sort((a, b) => a.position - b.position);
    
    if(channels.size === 0) {
      result += '';
      continue;
    }
    
    for (const channel of channels.values()) {
      result += `- ${channel.name}\n`;
      if (!previewOnly) {
        await channel.delete().catch(console.error);
      }
    }
  }

  return result.trim();
};

export const handleGeneralChannels = async (interaction: Interaction, previewOnly: boolean = false): Promise<string> => {
  const categoryNames = ["Tournoi"];
  let result = "";

  for (const categoryName of categoryNames) {
    const category = getCategoryByName(interaction.guild!, categoryName);
    if (!category) continue;

    const channels = interaction.guild!.channels.cache.filter(
      (ch): ch is TextChannel => ch.parentId === category.id && ch.type === ChannelType.GuildText
    );

    if(channels.size === 0) {
      result += '';
      continue;
    }

    for (const channel of channels.values()) {
      result += `- ${channel.name}\n`;
      if (!previewOnly) {
        try {
          const newChannel = await channel.clone({
            reason: "Channel reset as part of general channels reset"
          });
          await channel.delete();
          if (newChannel.position !== undefined) {
            await newChannel.setPosition(channel.position);
          }
        } catch (error) {
          console.error(`Error resetting channel ${channel.name}:`, error);
        }
      }
    }
  }

  return result;
};

export const createTeamChannel = async (
  interaction: Interaction,
  categoryName: string,
  channelName: string,
  channelType: ChannelType,
  teamRole: Role
): Promise<TextChannel | VoiceChannel | null> => {
  const category = getCategoryByName(interaction.guild!, categoryName);
  if (!category) {
    console.log(`Category with name ${categoryName} not found!`);
    return null;
  }

  console.log(teamRole.id);
  try {
    const existingChannel = interaction.guild!.channels.cache.find(
      channel => channel.name === channelName && channel.parentId === category.id
    );

    if (existingChannel) {
      console.log("Channel already exists:", existingChannel.name);
      return null;
    }

    const channel = await interaction.guild!.channels.create({
      name: channelName,
      type: channelType as ChannelType.GuildText | ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild!.roles.everyone.id,
          deny: PermissionsBitField.All,
          allow: PermissionsBitField.Flags.ViewChannel,
        },
        {
          id: teamRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.AddReactions,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.SendMessagesInThreads,
          ],
          deny: [
            PermissionsBitField.Flags.AttachFiles,
          ]
        },
      ],
    });

    console.log("Channel created:", channel.name);
    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
      return channel;
    } else {
      throw new Error("Created channel is not a text or voice channel.");
    }
  } catch (error) {
    console.error("Error creating channel:", error);
    throw new Error("There was an error creating the channel.");
  }
};