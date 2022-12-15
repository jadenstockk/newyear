import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from "discord.js"

module.exports = {
	name: "support",
	init: () => {
		return new SlashCommandBuilder()
			.setName("support")
			.setDescription("Get a link to our support server")
			.setDMPermission(false)
	},
	execute: async (interaction: CommandInteraction) => {
		return await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `New Year Support Server`,
						iconURL: interaction.client.user.displayAvatarURL()
					})
					.setColor("White")
					.setDescription(
						"Need some assistance or have a question? We're more than happy to help! Click the button below to join our support server."
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
}
