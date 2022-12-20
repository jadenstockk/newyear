import {
	ActivityType,
	Client,
	Embed,
	EmbedBuilder,
	WebhookClient
} from "discord.js"

import { config } from "dotenv"
import registerCommands from "./utils/registerCommands"
config()

const client = new Client({
	intents: ["Guilds", "DirectMessages", "DirectMessageReactions"]
})

client.once("ready", async () => {
	let count = 0
	setInterval(() => {
		switch (count) {
			case 0:
				client.user!.setActivity({
					name: "your new year's resolutions",
					type: ActivityType.Watching
				})
				count++
				break
			case 1:
				client.user!.setActivity({
					name: "to your thoughts about " + process.env.COUNTDOWN_YEAR!,
					type: ActivityType.Listening
				})
				count++
				break
			case 2:
				client.user!.setActivity({
					name: `${client.guilds.cache.size} servers say Happy New Year!`,
					type: ActivityType.Listening
				})
				count = 0
				break
		}
	}, 9000)
	require("./utils/database").connect()
	console.log(`Online in ${client.guilds.cache.size} guilds`)
	require("./utils/commands")(client)
	require("./utils/countdownUpdater")(client)

	client.on("guildCreate", (guild) => {
		const logsWebhook = new WebhookClient({ url: process.env.LOGS_WEBHOOK! })
		logsWebhook.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: "Joined New Guild" })
					.setDescription(`Joined guild: ${guild.name} (${guild.id})`)
					.setTimestamp()
					.setColor("Green")
					.setThumbnail(guild.iconURL())
					.setFooter({ text: (client.user?.username || "Bot") + " Logs" })
			]
		})
	})

	// Update Commands (Customize to suit your needs)
	if (process.env.REGISTER_COMMANDS === "true") {
		registerCommands({
			testMode: true,
			deletePreviousCommands: true,
			onlyDelete: true
		})
	}
})

client.login(process.env.TOKEN)
