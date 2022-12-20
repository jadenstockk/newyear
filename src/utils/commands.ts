import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders"
import {
	ButtonStyle,
	Client,
	Collection,
	EmbedBuilder,
	Events,
	Interaction
} from "discord.js"
import fs from "node:fs"
import path from "node:path"
import { crossEmoji } from "./constants"
import logError from "./logError"
import registerCommands from "./registerCommands"
import { command as typeCommand } from "./types"

module.exports = (client: Client) => {
	let commands = new Collection()

	const commandsPath = path.join(__dirname, "../commands")
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command: typeCommand = require(filePath)
		if ("init" in command && "execute" in command) {
			commands.set(command.name, command)
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "init" or "execute" property.`
			)
		}
	}

	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (!interaction.isChatInputCommand()) return

		let command = <typeCommand>commands.get(interaction.commandName)

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		try {
			await command.execute(interaction)
		} catch (err) {
			console.error(err)
			logError(
				err || "Unknown error in commands",
				"Command Handler: " + (command.name || "Unknown Command")
			)

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor("Red")
						.setAuthor({
							name: `Uh oh! Something went wrong.`,
							iconURL: client.emojis.cache.get(crossEmoji)?.url
						})
						.setDescription(
							"Please try again or join our support server for assistance"
						)
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel("Join Support Server")
							.setURL("https://discord.gg/4C5BQRm7uE")
							.setStyle(ButtonStyle.Link)
					)
				],
				ephemeral: true
			})
		}
	})
}
