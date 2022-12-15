import {
	CommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder
} from "discord.js"
import Guild from "../models/Guild"
import { crossEmoji, tickEmoji } from "../utils/constants"
import { getValidTimezone } from "../utils/timezoneManager"

module.exports = {
	name: "server-timezone",
	init: () => {
		return new SlashCommandBuilder()
			.setName("server-timezone")
			.setDescription("Change this server's default timezone")
			.addBooleanOption((option) =>
				option
					.setName("reset")
					.setDescription("Set this to true to reset the server's timezone")
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName("new")
					.setDescription("Choose a new city (be specific) or timezone")
					.setRequired(false)
			)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.setDMPermission(false)
	},
	execute: async (interaction: CommandInteraction) => {
		// Get the value of the "new" option
		const newInput = interaction.options.get("new")

		// Get the value of the "reset" option
		const resetInput = interaction.options.get("reset")

		// Find the guild in the database or create a new one
		let data =
			(await Guild.findOne({ guildId: interaction.guild?.id })) ||
			new Guild({ guildId: interaction.guild?.id })

		// Results
		interface resultsType {
			type: "reset" | "new" | "view"
			oldTimezone?: string
			newTimezone?: string
			success?: boolean
			message: string
		}
		let results: resultsType

		// If the reset option is true
		if (resetInput && resetInput.value == true) {
			// Set the default timezone
			const defaultTimezone = new Guild().timezone

			// Check if the guild's timezone is already the default
			if (defaultTimezone == data.timezone) {
				results = {
					type: "reset",
					oldTimezone: data.timezone,
					success: false,
					message: `The timezone is already set to ${data.timezone}`
				}
			} else {
				results = {
					type: "reset",
					oldTimezone: data.timezone,
					newTimezone: defaultTimezone,
					success: true,
					message: `Successfully reset the timezone`
				}
				data.timezone = defaultTimezone
			}

			// If there is a new option
		} else if (newInput && newInput.value) {
			// Find the timezone from the input
			const timezone = getValidTimezone("" + newInput.value)
			if (data.timezone == timezone) {
				results = {
					type: "new",
					oldTimezone: data.timezone,
					newTimezone: timezone,
					success: false,
					message: `The current timezone is already set to ${timezone}`
				}
			} else if (timezone) {
				results = {
					type: "new",
					oldTimezone: data.timezone,
					newTimezone: timezone,
					success: true,
					message: `Successfully updated the timezone`
				}
				data.timezone = timezone
			} else {
				results = {
					type: "new",
					oldTimezone: data.timezone,
					newTimezone: timezone,
					success: false,
					message: `The timezone, city, or country you entered is invalid`
				}
			}

			// If there is no new or reset option
		} else {
			results = {
				type: "view",
				oldTimezone: data.timezone,
				message: `The timezone is currently set to ${data.timezone}`
			}
		}

		let resultEmbed = new EmbedBuilder()

		switch (results.success) {
			case true:
				// If the results ARE successful
				resultEmbed.setColor("Green").setAuthor({
					name: results.message,
					iconURL:
						interaction.client.emojis.cache.get(tickEmoji)?.url ||
						interaction.client.user.displayAvatarURL()
				})
				data.save()
				if (results.type == "new" || results.type == "reset") {
					// If the results type is "new" or "reset"
					resultEmbed.addFields(
						{ name: "Old Timezone:", value: results.oldTimezone || "None" },
						{ name: "New Timezone:", value: results.newTimezone || "None" }
					)
				}
				break
			case false:
				// If the results are NOT successful
				resultEmbed.setColor("Red").setAuthor({
					name: results.message,
					iconURL:
						interaction.client.emojis.cache.get(crossEmoji)?.url ||
						interaction.client.user.displayAvatarURL()
				})
				if (results.type == "new")
					resultEmbed.setFooter({
						text: "Note: If you are using a city, try being more specific"
					})
				break
			default:
				// If the results success is undefined
				resultEmbed.setColor("White")
				resultEmbed.setAuthor({
					name: results.message,
					iconURL: interaction.client.user.displayAvatarURL()
				})
		}

		return await interaction.reply({
			embeds: [resultEmbed],
			ephemeral: true
		})
	}
}
