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
const timezoneManager_1 = require("../utils/timezoneManager");
module.exports = {
    name: "server-timezone",
    init: () => {
        return new discord_js_1.SlashCommandBuilder()
            .setName("server-timezone")
            .setDescription("Change this server's default timezone")
            .addBooleanOption((option) => option
            .setName("reset")
            .setDescription("Set this to true to reset the server's timezone")
            .setRequired(false))
            .addStringOption((option) => option
            .setName("new")
            .setDescription("Choose a new city (be specific) or timezone")
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
            .setDMPermission(false);
    },
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // Get the value of the "new" option
        const newInput = interaction.options.get("new");
        // Get the value of the "reset" option
        const resetInput = interaction.options.get("reset");
        // Find the guild in the database or create a new one
        let data = (yield Guild_1.default.findOne({ guildId: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id })) ||
            new Guild_1.default({ guildId: (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id });
        let results;
        // If the reset option is true
        if (resetInput && resetInput.value == true) {
            // Set the default timezone
            const defaultTimezone = new Guild_1.default().timezone;
            // Check if the guild's timezone is already the default
            if (defaultTimezone == data.timezone) {
                results = {
                    type: "reset",
                    oldTimezone: data.timezone,
                    success: false,
                    message: `The timezone is already set to ${data.timezone}`
                };
            }
            else {
                results = {
                    type: "reset",
                    oldTimezone: data.timezone,
                    newTimezone: defaultTimezone,
                    success: true,
                    message: `Successfully reset the timezone`
                };
                data.timezone = defaultTimezone;
            }
            // If there is a new option
        }
        else if (newInput && newInput.value) {
            // Find the timezone from the input
            const timezone = (0, timezoneManager_1.getValidTimezone)("" + newInput.value);
            if (data.timezone == timezone) {
                results = {
                    type: "new",
                    oldTimezone: data.timezone,
                    newTimezone: timezone,
                    success: false,
                    message: `The current timezone is already set to ${timezone}`
                };
            }
            else if (timezone) {
                results = {
                    type: "new",
                    oldTimezone: data.timezone,
                    newTimezone: timezone,
                    success: true,
                    message: `Successfully updated the timezone`
                };
                data.timezone = timezone;
            }
            else {
                results = {
                    type: "new",
                    oldTimezone: data.timezone,
                    newTimezone: timezone,
                    success: false,
                    message: `The timezone, city, or country you entered is invalid`
                };
            }
            // If there is no new or reset option
        }
        else {
            results = {
                type: "view",
                oldTimezone: data.timezone,
                message: `The timezone is currently set to ${data.timezone}`
            };
        }
        let resultEmbed = new discord_js_1.EmbedBuilder();
        switch (results.success) {
            case true:
                // If the results ARE successful
                resultEmbed.setColor("Green").setAuthor({
                    name: results.message,
                    iconURL: ((_c = interaction.client.emojis.cache.get(constants_1.tickEmoji)) === null || _c === void 0 ? void 0 : _c.url) ||
                        interaction.client.user.displayAvatarURL()
                });
                data.save();
                if (results.type == "new" || results.type == "reset") {
                    // If the results type is "new" or "reset"
                    resultEmbed.addFields({ name: "Old Timezone:", value: results.oldTimezone || "None" }, { name: "New Timezone:", value: results.newTimezone || "None" });
                }
                break;
            case false:
                // If the results are NOT successful
                resultEmbed.setColor("Red").setAuthor({
                    name: results.message,
                    iconURL: ((_d = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _d === void 0 ? void 0 : _d.url) ||
                        interaction.client.user.displayAvatarURL()
                });
                if (results.type == "new")
                    resultEmbed.setFooter({
                        text: "Note: If you are using a city, try being more specific"
                    });
                break;
            default:
                // If the results success is undefined
                resultEmbed.setColor("White");
                resultEmbed.setAuthor({
                    name: results.message,
                    iconURL: interaction.client.user.displayAvatarURL()
                });
        }
        return yield interaction.reply({
            embeds: [resultEmbed],
            ephemeral: true
        });
    })
};
