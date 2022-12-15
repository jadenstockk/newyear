"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = __importDefault(require("../models/Guild"));
const constants_1 = require("../utils/constants");
const countdownGenerator_1 = require("../utils/countdownGenerator");
module.exports = {
    name: "server-countdown",
    init: () => {
        return new discord_js_1.SlashCommandBuilder()
            .setName("server-countdown")
            .setDescription("Choose a channel where server countdown updates will be sent (uses server's default timezone)")
            .addChannelOption((option) => option
            .setName("channel")
            .setDescription("Leave this out to automatically create a new channel (recommended)")
            .addChannelTypes(discord_js_1.ChannelType.GuildText)
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
            .setDMPermission(false);
    },
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        try {
            // Fetch the guild data
            const data = (yield Guild_1.default.findOne({ guildId: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id })) ||
                new Guild_1.default({ guildId: (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id });
            // Get the guild's timezone
            const timezone = data.timezone;
            // If the user if missing permissions
            const permissions = (_d = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.me) === null || _d === void 0 ? void 0 : _d.permissions;
            if (!(permissions === null || permissions === void 0 ? void 0 : permissions.has(discord_js_1.PermissionFlagsBits.ManageChannels)) ||
                !(permissions === null || permissions === void 0 ? void 0 : permissions.has(discord_js_1.PermissionFlagsBits.SendMessages)) ||
                !(permissions === null || permissions === void 0 ? void 0 : permissions.has(discord_js_1.PermissionFlagsBits.ManageMessages)) ||
                !permissions.has(discord_js_1.PermissionFlagsBits.EmbedLinks)) {
                return yield interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setAuthor({
                            name: `I am missing permissions needed to send countdown updates`,
                            iconURL: ((_e = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _e === void 0 ? void 0 : _e.url) ||
                                interaction.client.user.displayAvatarURL()
                        })
                            .setColor("Red")
                            .setDescription("Go to server settings. Go to **Roles -> New Year -> Permissions** then scroll down to each required permission and toggle it on.")
                            .addFields({
                            name: "Required Permissions",
                            value: "`VIEW CHANNELS`\n`SEND MESSAGES`\n`MANAGE MESSAGES`\n`VIEW CHANNELS`\n`EMBED LINKS`"
                        })
                    ],
                    components: [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setLabel("Join Support Server")
                            .setURL("https://discord.gg/4C5BQRm7uE")
                            .setStyle(discord_js_1.ButtonStyle.Link))
                    ],
                    ephemeral: true
                });
            }
            // Get the value of the "channel" option
            let channel = (_f = interaction.options.get("channel")) === null || _f === void 0 ? void 0 : _f.channel;
            // Check if there is an existing channel
            let existingChannel = ((_g = data.countdown) === null || _g === void 0 ? void 0 : _g.channelId)
                ? (_h = interaction.guild) === null || _h === void 0 ? void 0 : _h.channels.cache.get(data.countdown.channelId)
                : null;
            // If the channel inputted is the same as the existing channel
            if (existingChannel && channel && (existingChannel === null || existingChannel === void 0 ? void 0 : existingChannel.id) === (channel === null || channel === void 0 ? void 0 : channel.id)) {
                return yield interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setAuthor({
                            name: `The countdown channel you entered is the same as the existing countdown channel`,
                            iconURL: ((_j = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _j === void 0 ? void 0 : _j.url) ||
                                interaction.client.user.displayAvatarURL()
                        })
                            .setColor("Red")
                    ],
                    ephemeral: true
                });
            }
            // Function that updates the countdown channel and sends the initial countdown
            function sendInitialCountdown(channelId) {
                var _a, _b;
                return __awaiter(this, void 0, void 0, function* () {
                    const fetchedChannel = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.fetch(channelId));
                    // Set an error message
                    let errorMessage = {
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setAuthor({
                                name: `There was a problem when setting up the countdown channel`,
                                iconURL: ((_b = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _b === void 0 ? void 0 : _b.url) ||
                                    interaction.client.user.displayAvatarURL()
                            })
                                .setColor("Red")
                        ],
                        components: [
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                                .setLabel("Join Support Server")
                                .setURL("https://discord.gg/4C5BQRm7uE")
                                .setStyle(discord_js_1.ButtonStyle.Link))
                        ],
                        ephemeral: true
                    };
                    // If the channel could not be fetched
                    if (!fetchedChannel) {
                        errorMessage.embeds[0].setDescription("Try again after checking that New Year has the correct permissions or go to our support server for further assistance");
                        return yield interaction.reply(errorMessage);
                        // If the channel is not text based
                    }
                    else if (!fetchedChannel.isTextBased()) {
                        errorMessage.embeds[0].setDescription("The channel you entered doesn't seem to be a 'text channel' which is required for the countdown. Choose a different channel or go to our support server for further assistance.");
                        return yield interaction.reply(errorMessage);
                        // If the fetched channel is a text channel
                    }
                    else {
                        // Generate the countdown message
                        const countdown = yield (0, countdownGenerator_1.generateCountdown)(interaction.client, data.timezone);
                        // Send the initial countdown message and update the guild data
                        const msg = yield fetchedChannel.send({ embeds: [countdown] });
                        data.countdown = {
                            channelId: fetchedChannel.id,
                            messageId: msg.id,
                            completed: false
                        };
                        yield data.save();
                        yield msg.pin().catch(() => console.log(`Failed to pin message`));
                    }
                });
            }
            let successEmbedMessage = {
                embeds: [new discord_js_1.EmbedBuilder().setColor("Green")],
                ephemeral: true
            };
            if (existingChannel) {
                successEmbedMessage.embeds[0].addFields({
                    name: "Old Channel",
                    value: `${existingChannel}`
                });
            }
            if (channel) {
                successEmbedMessage.embeds[0].addFields({
                    name: "New Channel",
                    value: `${channel}`
                });
            }
            // If the user inputs a channel
            if (channel) {
                yield sendInitialCountdown(channel.id);
                successEmbedMessage.embeds[0].setAuthor({
                    name: "The countdown channel has been successfully updated",
                    iconURL: ((_k = interaction.client.emojis.cache.get(constants_1.tickEmoji)) === null || _k === void 0 ? void 0 : _k.url) ||
                        interaction.client.user.displayAvatarURL()
                });
                // If the user DOES NOT input a channel
            }
            else {
                const createChannelErrorMessage = {
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setAuthor({
                            name: `The countdown channel could not be created`,
                            iconURL: ((_l = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _l === void 0 ? void 0 : _l.url) ||
                                interaction.client.user.displayAvatarURL()
                        })
                            .setDescription("We ran into an error when creating the countdown channel, check that New Year has the correct permissions or go to our support server for further assistance.")
                            .setColor("Red")
                    ],
                    components: [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setLabel("Join Support Server")
                            .setURL("https://discord.gg/4C5BQRm7uE")
                            .setStyle(discord_js_1.ButtonStyle.Link))
                    ],
                    ephemeral: true
                };
                const newChannel = yield interaction.guild.channels.create({
                    name: "🥳new-year-countdown",
                    reason: "Created New Year Countdown Channel",
                    type: discord_js_1.ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: (_m = interaction.guild) === null || _m === void 0 ? void 0 : _m.roles.everyone.id,
                            deny: [discord_js_1.PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: interaction.client.user.id,
                            allow: [
                                discord_js_1.PermissionFlagsBits.SendMessages,
                                discord_js_1.PermissionFlagsBits.ViewChannel,
                                discord_js_1.PermissionFlagsBits.AddReactions,
                                discord_js_1.PermissionFlagsBits.EmbedLinks,
                                discord_js_1.PermissionFlagsBits.UseExternalEmojis
                            ]
                        }
                    ]
                });
                if (!newChannel) {
                    return yield interaction.reply(createChannelErrorMessage);
                }
                yield sendInitialCountdown(newChannel.id);
                successEmbedMessage.embeds[0].setAuthor({
                    name: "The countdown channel has been successfully created",
                    iconURL: ((_o = interaction.client.emojis.cache.get(constants_1.tickEmoji)) === null || _o === void 0 ? void 0 : _o.url) ||
                        interaction.client.user.displayAvatarURL()
                });
                successEmbedMessage.embeds[0].addFields({
                    name: "New Channel",
                    value: `${newChannel}`
                });
            }
            return yield interaction.reply(successEmbedMessage);
        }
        catch (err) {
            console.log(err);
            return yield interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setAuthor({
                        name: `It seems something went wrong`,
                        iconURL: ((_p = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _p === void 0 ? void 0 : _p.url) ||
                            interaction.client.user.displayAvatarURL()
                    })
                        .setColor("Red")
                        .setDescription("It's usually something to do with missing permissions. Make sure that New Year has the correct permissions (as well as channel permissions) and try again. If the problem persists, contact us on our support server for further assistance.")
                        .addFields({
                        name: "Required Permissions",
                        value: "`VIEW CHANNELS`\n`SEND MESSAGES`\n`MANAGE MESSAGES`\n`VIEW CHANNELS`\n`EMBED LINKS`"
                    })
                ],
                components: [
                    new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setLabel("Join Support Server")
                        .setURL("https://discord.gg/4C5BQRm7uE")
                        .setStyle(discord_js_1.ButtonStyle.Link))
                ],
                ephemeral: true
            });
        }
    })
};
