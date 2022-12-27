import { EmbedBuilder } from "@discordjs/builders"
import { Colors, WebhookClient } from "discord.js"

export default function logError(error: any, context: string) {
	const logsWebhook = new WebhookClient({ url: process.env.LOGS_WEBHOOK! })
	logsWebhook
		.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: "There was an error " + context })
					.setDescription(error.stack || error.message || error)
					.setTimestamp()
					.setColor(Colors.Red)
			]
		})
		.catch((err) => console.log(err))
}
