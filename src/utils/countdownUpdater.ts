import { ChannelType, Client } from "discord.js"
import spacetime from "spacetime"
import Guild from "../models/Guild"
import { generateCountdown } from "./countdownGenerator"
import { getTimeUntilNewYear } from "./timezoneManager"

module.exports = (client: Client) => {
	setTimeout(() => {
		setInterval(async () => {
			console.log(
				"Updating countdowns... | " +
					spacetime.now("Africa/Johannesburg").format("nice")
			)
			try {
				const guilds = await Guild.find()
				guilds.forEach(async (data) => {
					if (
						!data.guildId ||
						!data.countdown ||
						!data.countdown.channelId ||
						data.countdown.completed
					)
						return

					const guild = client.guilds.cache.get(data.guildId)
					if (!guild) {
						return
					}

					const ch = await guild.channels.fetch(data.countdown.channelId)

					if (!ch || ch.type !== ChannelType.GuildText) {
						data.countdown = undefined
						return await data.save().catch((err) => console.log(err))
					}

					const msgs = await ch.messages.fetch()
					const message = await msgs
						.get(data.countdown!.messageId)
						?.edit({
							embeds: [await generateCountdown(client, data.timezone)]
						})
						.catch((err) => console.log(err))

					// Generate the countdown message
					const countdown = await generateCountdown(client, data.timezone)

					if (!message) {
						// Send the initial countdown message and update the guild data
						const msg = await ch.send({ embeds: [countdown] })

						data.countdown = {
							channelId: ch.id,
							messageId: msg.id,
							completed: false
						}
						await data.save().catch((err) => console.log(err))
						await msg.pin()
					} else {
						// Update the countdown message
						const msg = await message.edit({ embeds: [countdown] })

						data.countdown = {
							channelId: ch.id,
							messageId: msg.id,
							completed: false
						}
						await data.save()
						await msg.pin()
					}

					if (getTimeUntilNewYear(data.timezone).seconds < 8) {
						data.countdown!.completed = true
						await data.save()
					}
				})
			} catch (err) {
				console.error("Countdown Update Error", err)
			}
		}, 60000)
	}, 60000 - (new Date().getTime() % 60000))
}
