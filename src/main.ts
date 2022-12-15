import { ActivityType, Client } from "discord.js"

import { config } from "dotenv"
import registerCommands from "./utils/registerCommands"
config()

const client = new Client({
	intents: ["Guilds", "DirectMessages", "DirectMessageReactions"]
})

client.once("ready", () => {
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

	// Update Commands (Customize to suit your needs)
	if (process.env.REGISTER_COMMANDS === "true") {
		registerCommands({
			testMode: false,
			deletePreviousCommands: true,
			onlyDelete: false
		})
	}
})

client.login(process.env.TOKEN)
