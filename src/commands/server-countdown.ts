import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	CommandInteraction,
	EmbedBuilder,
	GuildChannel,
	GuildChannelManager,
	GuildMember,
	PermissionFlagsBits,
	PermissionOverwrites,
	SlashCommandBuilder,
	TextChannel
} from "discord.js"
import Guild from "../models/Guild"
import { crossEmoji, tickEmoji } from "../utils/constants"
import { getValidTimezone } from "../utils/timezoneManager"
import { generateCountdown } from "../utils/countdownGenerator"

module.exports = {
	name: "server-countdown",
	init: () => {
		return new SlashCommandBuilder()
			.setName("server-countdown")
			.setDescription(
				"Choose a channel where server countdown updates will be sent (uses server's default timezone)"
			)
			.addChannelOption((option) =>
				option
					.setName("channel")
					.setDescription(
						"Leave this out to automatically create a new channel (recommended)"
					)
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false)
			)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.setDMPermission(false)
	},
	execute: async (interaction: CommandInteraction) => {
		try {
			// Fetch the guild data
			const data =
				(await Guild.findOne({ guildId: interaction.guild?.id })) ||
				new Guild({ guildId: interaction.guild?.id })

			// Get the guild's timezone
			const timezone = data.timezone

			// If the user if missing permissions
			const permissions = interaction.guild?.members.me?.permissions
			if (
				!permissions?.has(PermissionFlagsBits.ManageChannels) ||
				!permissions?.has(PermissionFlagsBits.SendMessages) ||
				!permissions?.has(PermissionFlagsBits.ManageMessages) ||
				!permissions.has(PermissionFlagsBits.EmbedLinks)
			) {
				return await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: `I am missing permissions needed to send countdown updates`,
								iconURL:
									interaction.client.emojis.cache.get(crossEmoji)?.url ||
									interaction.client.user.displayAvatarURL()
							})
							.setColor("Red")
							.setDescription(
								"Go to server settings. Go to **Roles -> New Year -> Permissions** then scroll down to each required permission and toggle it on."
							)
							.addFields({
								name: "Required Permissions",
								value:
									"`VIEW CHANNELS`\n`SEND MESSAGES`\n`MANAGE MESSAGES`\n`VIEW CHANNELS`\n`EMBED LINKS`"
							})
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

			// Get the value of the "channel" option
			let channel = interaction.options.get("channel")?.channel

			// Check if there is an existing channel
			let existingChannel = data.countdown?.channelId
				? interaction.guild?.channels.cache.get(data.countdown.channelId)
				: null

			// If the channel inputted is the same as the existing channel
			if (existingChannel && channel && existingChannel?.id === channel?.id) {
				return await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: `The countdown channel you entered is the same as the existing countdown channel`,
								iconURL:
									interaction.client.emojis.cache.get(crossEmoji)?.url ||
									interaction.client.user.displayAvatarURL()
							})
							.setColor("Red")
					],
					ephemeral: true
				})
			}

			// Function that updates the countdown channel and sends the initial countdown
			async function sendInitialCountdown(channelId: string) {
				const fetchedChannel = await interaction.guild?.channels.fetch(
					channelId
				)

				// Set an error message
				let errorMessage = {
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: `There was a problem when setting up the countdown channel`,
								iconURL:
									interaction.client.emojis.cache.get(crossEmoji)?.url ||
									interaction.client.user.displayAvatarURL()
							})
							.setColor("Red")
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
				}

				// If the channel could not be fetched
				if (!fetchedChannel) {
					errorMessage.embeds[0].setDescription(
						"Try again after checking that New Year has the correct permissions or go to our support server for further assistance"
					)
					return await interaction.reply(errorMessage)

					// If the channel is not text based
				} else if (!fetchedChannel.isTextBased()) {
					errorMessage.embeds[0].setDescription(
						"The channel you entered doesn't seem to be a 'text channel' which is required for the countdown. Choose a different channel or go to our support server for further assistance."
					)
					return await interaction.reply(errorMessage)

					// If the fetched channel is a text channel
				} else {
					// Generate the countdown message
					const countdown = await generateCountdown(
						interaction.client,
						data.timezone
					)

					// Send the initial countdown message and update the guild data
					const msg = await fetchedChannel.send({ embeds: [countdown] })
					data.countdown = {
						channelId: fetchedChannel.id,
						messageId: msg.id,
						completed: false
					}
					await data.save()
					await msg.pin()
				}
			}

			let successEmbedMessage = {
				embeds: [new EmbedBuilder().setColor("Green")],
				ephemeral: true
			}

			if (existingChannel) {
				successEmbedMessage.embeds[0].addFields({
					name: "Old Channel",
					value: `${existingChannel}`
				})
			}
			if (channel) {
				successEmbedMessage.embeds[0].addFields({
					name: "New Channel",
					value: `${channel}`
				})
			}

			// If the user inputs a channel
			if (channel) {
				await sendInitialCountdown(channel.id)
				successEmbedMessage.embeds[0].setAuthor({
					name: "The countdown channel has been successfully updated",
					iconURL:
						interaction.client.emojis.cache.get(tickEmoji)?.url ||
						interaction.client.user.displayAvatarURL()
				})

				// If the user DOES NOT input a channel
			} else {
				const createChannelErrorMessage = {
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: `The countdown channel could not be created`,
								iconURL:
									interaction.client.emojis.cache.get(crossEmoji)?.url ||
									interaction.client.user.displayAvatarURL()
							})
							.setDescription(
								"We ran into an error when creating the countdown channel, check that New Year has the correct permissions or go to our support server for further assistance."
							)
							.setColor("Red")
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
				}

				const newChannel = await interaction.guild!.channels.create({
					name: "🥳new-year-countdown",
					reason: "Created New Year Countdown Channel",
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{
							id: interaction.guild?.roles.everyone.id!,
							deny: [PermissionFlagsBits.SendMessages]
						},
						{
							id: interaction.client.user.id,
							allow: [
								PermissionFlagsBits.SendMessages,
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.AddReactions,
								PermissionFlagsBits.EmbedLinks,
								PermissionFlagsBits.UseExternalEmojis
							]
						}
					]
				})

				if (!newChannel) {
					return await interaction.reply(createChannelErrorMessage)
				}
				await sendInitialCountdown(newChannel.id)
				successEmbedMessage.embeds[0].setAuthor({
					name: "The countdown channel has been successfully created",
					iconURL:
						interaction.client.emojis.cache.get(tickEmoji)?.url ||
						interaction.client.user.displayAvatarURL()
				})
				successEmbedMessage.embeds[0].addFields({
					name: "New Channel",
					value: `${newChannel}`
				})
			}

			return await interaction.reply(successEmbedMessage)
		} catch (err) {
			console.log(err)
			return await interaction
				.reply({
					embeds: [
						new EmbedBuilder()
							.setAuthor({
								name: `It seems something went wrong`,
								iconURL:
									interaction.client.emojis.cache.get(crossEmoji)?.url ||
									interaction.client.user.displayAvatarURL()
							})
							.setColor("Red")
							.setDescription(
								"It's usually something to do with missing permissions. Make sure that New Year has the correct permissions (as well as channel permissions) and try again. If the problem persists, contact us on our support server for further assistance."
							)
							.addFields({
								name: "Required Permissions",
								value:
									"`VIEW CHANNELS`\n`SEND MESSAGES`\n`MANAGE MESSAGES`\n`VIEW CHANNELS`\n`EMBED LINKS`"
							})
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
				.catch((err) => console.log(err))
		}
	}
}
