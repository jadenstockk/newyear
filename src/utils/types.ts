import {
	ActivityType,
	CommandInteraction,
	SlashCommandBuilder
} from "discord.js"

export interface command {
	name: string
	init: () => SlashCommandBuilder
	execute: (interaction: CommandInteraction) => CommandInteraction
}

export interface presence {
	name: string
	type: ActivityType
}
