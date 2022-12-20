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
const countdownGenerator_1 = require("../utils/countdownGenerator");
module.exports = {
    name: "countdown",
    init: () => {
        return new discord_js_1.SlashCommandBuilder()
            .setName("countdown")
            .setDescription("Find out how much time is left until New Year")
            .addStringOption((option) => option
            .setName("timezone")
            .setDescription("Use this option to override the default timezone")
            .setRequired(false));
    },
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Set the default timezone
            let timezone = new Guild_1.default().timezone;
            // Get the value of the "timezone" option
            const timezoneInput = interaction.options.get("timezone");
            // If the user inputs a timezone
            if (timezoneInput && timezoneInput.value) {
                timezone = (0, timezoneManager_1.getValidTimezone)("" + timezoneInput.value);
                if (!timezone)
                    return yield interaction.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setAuthor({
                                name: `The timezone, city, or country you entered is invalid. Please try again.`,
                                iconURL: ((_a = interaction.client.emojis.cache.get(constants_1.crossEmoji)) === null || _a === void 0 ? void 0 : _a.url) ||
                                    interaction.client.user.displayAvatarURL()
                            })
                                .setColor("Red")
                                .setFooter({
                                text: "Note: If you are using a city, try being more specific"
                            })
                        ],
                        ephemeral: true
                    });
                // If the command is used in a guild without specifying a timezone
            }
            else {
                if (interaction.guild) {
                    // Get the guild's timezone
                    const data = (yield Guild_1.default.findOne({ guildId: interaction.guild.id })) ||
                        new Guild_1.default({ guildId: interaction.guild.id });
                    timezone = data.timezone;
                    // If the command is used in a DM without specifying a timezone
                }
            }
            return yield interaction.reply({
                embeds: [yield (0, countdownGenerator_1.generateCountdown)(interaction.client, timezone)]
            });
        }
        catch (err) {
            console.log(err);
        }
    })
};
