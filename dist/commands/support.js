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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: "support",
    init: () => {
        return new discord_js_1.SlashCommandBuilder()
            .setName("support")
            .setDescription("Get a link to our support server")
            .setDMPermission(false);
    },
    execute: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        return yield interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({
                    name: `New Year Support Server`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                    .setColor("White")
                    .setDescription("Need some assistance or have a question? We're more than happy to help! Click the button below to join our support server.")
            ],
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setLabel("Join Support Server")
                    .setURL("https://discord.gg/4C5BQRm7uE")
                    .setStyle(discord_js_1.ButtonStyle.Link))
            ],
            ephemeral: true
        });
    })
};
