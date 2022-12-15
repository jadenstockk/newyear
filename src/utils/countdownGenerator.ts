import { EmbedBuilder } from "@discordjs/builders"
import { Client, Colors } from "discord.js"
import { countdownGif } from "./constants"
import { getTimeUntilNewYear } from "./timezoneManager"

export async function generateCountdown(client: Client, timezone: string) {
	const timeUntilNewYear = getTimeUntilNewYear(timezone)
	const COUNTDOWN_YEAR = process.env.COUNTDOWN_YEAR!

	// Days
	let days = "" + timeUntilNewYear.days
	if (timeUntilNewYear.days === 1) days += " day"
	else if (timeUntilNewYear.days < 1) days = "Less than a day"
	else days += " days"

	// Hours
	let hours = "" + timeUntilNewYear.hours
	if (timeUntilNewYear.hours === 1) hours += " hour"
	else if (timeUntilNewYear.hours < 1) hours = "Less than an hour"
	else hours += " hours"

	// Minutes
	let minutes = "" + timeUntilNewYear.minutes
	if (timeUntilNewYear.minutes === 1) minutes += " minute"
	else if (timeUntilNewYear.minutes < 1) minutes = "Less than a minute"
	else minutes += " minutes"

	// Seconds
	let seconds = "" + timeUntilNewYear.seconds
	if (timeUntilNewYear.seconds === 1) seconds += " second"
	else if (timeUntilNewYear.seconds < 1) seconds = "Less than a second"
	else seconds += " seconds"

	if (timeUntilNewYear.seconds < 8)
		return await new EmbedBuilder()
			.setAuthor({
				name: `Happy New Year! ${COUNTDOWN_YEAR} is here!`,
				iconURL: client.user?.displayAvatarURL()
			})
			.setColor(Colors.White)
			.setFooter({
				text: "New Year Countdown",
				iconURL: client.user?.displayAvatarURL()
			})
			.setImage(countdownGif)
			.setTimestamp()

	return await new EmbedBuilder()
		.setAuthor({
			name: `${COUNTDOWN_YEAR} is in...`,
			iconURL: client.user?.displayAvatarURL()
		})
		.setDescription(
			`**${days}** or\n**${hours}** or\n**${minutes}** or\n**${seconds}**\n\nTimezone set to: \`${timezone}\``
		)
		.setColor(Colors.White)
		.setFooter({
			text: "New Year Countdown",
			iconURL: client.user?.displayAvatarURL()
		})
		.setTimestamp()
		.setThumbnail(
			"https://c.tenor.com/PXfDMQ8dxaEAAAAi/nemzeti%C3%BCnnep-fireworks.gif"
		)
}
