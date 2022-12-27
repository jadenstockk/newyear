import { ChannelType, Client, PermissionFlagsBits } from "discord.js"
import spacetime from "spacetime"
import Guild from "../models/Guild"
import { generateCountdown } from "./countdownGenerator"
import logError from "./logError"
import { getTimeUntilNewYear } from "./timezoneManager"

module.exports = (client: Client) => {
	let test = false
	async function update() {
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

				if (!guild.channels.cache.get(data.countdown.channelId)) return

				const ch = await guild.channels.fetch(data.countdown.channelId)

				if (!ch || ch.type !== ChannelType.GuildText) {
					data.countdown = undefined
					return await data.save()
				}

				if (
					!ch
						.permissionsFor(guild.members.me!)
						?.has(
							PermissionFlagsBits.SendMessages &&
								PermissionFlagsBits.EmbedLinks &&
								PermissionFlagsBits.ViewChannel
						)
				)
					return

				const msgs = await ch.messages.fetch()
				if (!msgs) return
				const message = await msgs.get(data.countdown.messageId)?.edit({
					embeds: [await generateCountdown(client, data.timezone)]
				})

				// Generate the countdown message
				const countdown = await generateCountdown(client, data.timezone)

				if (!message) {
					// Send the initial countdown message and update the guild data
					const msg = await ch.send({ embeds: [countdown] })
					if (!msg) return

					data.countdown = {
						channelId: ch.id,
						messageId: msg.id,
						completed: false
					}
					await data.save()
					await msg
						.pin()
						.catch(() => console.log("Failed to pin countdown message"))
				} else {
					// Update the countdown message
					const msg = await message.edit({ embeds: [countdown] })
					if (!msg) return

					data.countdown = {
						channelId: ch.id,
						messageId: msg.id,
						completed: false
					}
					await data.save()
					await msg
						.pin()
						.catch(() => console.log("Failed to pin countdown message"))
				}

				if (getTimeUntilNewYear(data.timezone).seconds < 8) {
					data.countdown!.completed = true
					await data.save()
				}
			})
		} catch (err) {
			console.error("Countdown Update Error", err)
			logError(
				err || "Unknown error in countdown updater baseline",
				"Countdown Updater Baseline"
			)
		}
	}

	setTimeout(
		() => {
			if (test) {
				update()
			}

			setInterval(
				() => {
					update()
				},
				test ? 20000 : 60000
			)
		},
		test ? 0 : 60000 - (new Date().getTime() % 60000)
	)
}
