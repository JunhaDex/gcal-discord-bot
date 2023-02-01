import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface Interaction {
  name: string;
  execute: (interaction: CommandInteraction, extra: any) => Promise<void>;
}
