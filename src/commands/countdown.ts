import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from "discord.js"
import Guild from "../models/Guild"
import { crossEmoji } from "../utils/constants"
import { getValidTimezone } from "../utils/timezoneManager"
import { generateCountdown } from "../utils/countdownGenerator"

module.exports = {
	name: "countdown",
	init: () => {
		return new SlashCommandBuilder()
			.setName("countdown")
			.setDescription("Find out how much time is left until New Year")
			.addStringOption((option) =>
				option
					.setName("timezone")
					.setDescription("Use this option to override the default timezone")
					.setRequired(false)
			)
	},
	execute: async (interaction: CommandInteraction) => {
		try {
			// Set the default timezone
			let timezone: string = new Guild().timezone

			// Get the value of the "timezone" option
			const timezoneInput = interaction.options.get("timezone")

			// If the user inputs a timezone
			if (timezoneInput && timezoneInput.value) {
				timezone = getValidTimezone("" + timezoneInput.value)
				if (!timezone)
					return await interaction.reply({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: `The timezone, city, or country you entered is invalid. Please try again.`,
									iconURL:
										interaction.client.emojis.cache.get(crossEmoji)?.url ||
										interaction.client.user.displayAvatarURL()
								})
								.setColor("Red")
								.setFooter({
									text: "Note: If you are using a city, try being more specific"
								})
						],
						ephemeral: true
					})

				// If the command is used in a guild without specifying a timezone
			} else {
				if (interaction.guild) {
					// Get the guild's timezone
					const data =
						(await Guild.findOne({ guildId: interaction.guild.id })) ||
						new Guild({ guildId: interaction.guild.id })

					timezone = data.timezone

					// If the command is used in a DM without specifying a timezone
				}
			}

			return await interaction.reply({
				embeds: [await generateCountdown(interaction.client, timezone)]
			})
		} catch (err) {
			console.log(err)
		}
	}
}
