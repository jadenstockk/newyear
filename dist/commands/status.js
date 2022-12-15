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
module.exports = {
    name: "status",
    init: () => {
        return new discord_js_1.SlashCommandBuilder()
            .setName("status")
            .setDescription("Provides information about the bot's current status");
    },
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        function databaseOnline() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield Guild_1.default.findOne({ guildId: 1234 });
                    return `${interaction.client.emojis.cache.get(constants_1.tickEmoji)} Online`;
                }
                catch (err) {
                    console.error(err);
                    return `${interaction.client.emojis.cache.get(constants_1.crossEmoji)} Offline`;
                }
            });
        }
        let databaseStatus = yield databaseOnline();
        try {
            return yield interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setAuthor({
                        name: `${interaction.client.user.username} Status`,
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                        .addFields({
                        name: "Status",
                        value: `${interaction.client.emojis.cache.get(constants_1.tickEmoji)} Online`
                    }, {
                        name: "Database",
                        value: databaseStatus
                    }, {
                        name: "Response Latency",
                        value: `${Math.abs(interaction.createdTimestamp - Date.now())} ms`
                    }, {
                        name: "Server Count",
                        value: `${interaction.client.guilds.cache.size}`
                    })
                        .setColor("White")
                ],
                ephemeral: true
            });
        }
        catch (err) {
            console.log(err);
        }
    })
};
