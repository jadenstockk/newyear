"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
function logError(error, context) {
    const logsWebhook = new discord_js_1.WebhookClient({ url: process.env.LOGS_WEBHOOK });
    logsWebhook
        .send({
        embeds: [
            new builders_1.EmbedBuilder()
                .setAuthor({ name: "There was an error " + context })
                .setDescription(error.stack || error.message || error)
                .setTimestamp()
                .setColor(discord_js_1.Colors.Red)
        ]
    })
        .catch((err) => console.log(err));
}
exports.default = logError;
