import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from "discord.js"
import Guild from "../models/Guild"
import { crossEmoji, tickEmoji } from "../utils/constants"

module.exports = {
	name: "status",
	init: () => {
		return new SlashCommandBuilder()
			.setName("status")
			.setDescription("Provides information about the bot's current status")
	},
	execute: async (interaction: CommandInteraction) => {
		async function databaseOnline() {
			try {
				await Guild.findOne({ guildId: 1234 })
				return `${interaction.client.emojis.cache.get(tickEmoji)} Online`
			} catch (err) {
				console.error(err)
				return `${interaction.client.emojis.cache.get(crossEmoji)} Offline`
			}
		}

		let databaseStatus = await databaseOnline()

		try {
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: `${interaction.client.user.username} Status`,
							iconURL: interaction.client.user.displayAvatarURL()
						})
						.addFields(
							{
								name: "Status",
								value: `${interaction.client.emojis.cache.get(
									tickEmoji
								)} Online`
							},
							{
								name: "Database",
								value: databaseStatus
							},
							{
								name: "Response Latency",
								value: `${Math.abs(
									interaction.createdTimestamp - Date.now()
								)} ms`
							},
							{
								name: "Server Count",
								value: `${interaction.client.guilds.cache.size}`
							}
						)
						.setColor("White")
				],
				ephemeral: true
			})
		} catch (err) {
			console.log(err)
		}
	}
}
