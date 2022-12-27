import { Client } from "discord.js"

const { AutoPoster } = require("topgg-autoposter")

module.exports = (client: Client) => {
	const topGGToken = process.env.TOPGG_TOKEN
	if (!topGGToken) return

	const ap = AutoPoster(topGGToken, client)

	ap.on("posted", () => {
		console.log("Posted stats to Top.gg!")
	})
}
