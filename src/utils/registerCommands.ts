import { Client, CommandInteraction, REST, Routes } from "discord.js"
import fs from "node:fs"
import path from "node:path"

interface optionsInterface {
	testMode: boolean
	deletePreviousCommands?: boolean
	onlyDelete?: boolean
}

export default async function registerCommands(options: optionsInterface) {
	if (!options || options.testMode == undefined) {
		throw new Error("Options are required when registering slash commands.")
	}

	const commands: CommandInteraction[] = []

	const commandsPath = path.join(__dirname, "../commands")
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file: any) => file.endsWith(".js") || file.endsWith(".ts"))

	for (const file of commandFiles) {
		const command = require(`../commands/${file}`)
		commands.push(command.init().toJSON())
	}

	const CLIENT_ID: string = process.env.CLIENT_ID!
	const TEST_GUILD_ID: string = process.env.TEST_GUILD_ID!
	const TOKEN: string = process.env.TOKEN!

	const rest = new REST({ version: "10" }).setToken(TOKEN)

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		)

		if (options.testMode) {
			if (options.deletePreviousCommands) {
				await rest
					.put(Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
						body: []
					})
					.then(() => console.log("Successfully deleted all guild commands."))
					.catch(console.error)
			}

			if (!options.onlyDelete) {
				const data: any = await rest.put(
					Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
					{ body: commands }
				)

				console.log(
					`Successfully reloaded ${data.length} application guild (/) commands.`
				)
			}
		} else {
			if (options.deletePreviousCommands) {
				await rest
					.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
					.then(() =>
						console.log("Successfully deleted all application commands.")
					)
					.catch(console.error)
			}

			if (!options.onlyDelete) {
				const data: any = await rest.put(
					Routes.applicationCommands(CLIENT_ID),
					{
						body: commands
					}
				)

				console.log(
					`Successfully reloaded ${data.length} application client (/) commands.`
				)
			}
		}
	} catch (err) {
		console.error(err)
	}
}
