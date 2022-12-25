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
const dotenv_1 = require("dotenv");
const registerCommands_1 = __importDefault(require("./utils/registerCommands"));
(0, dotenv_1.config)();
const client = new discord_js_1.Client({
    intents: ["Guilds", "DirectMessages", "DirectMessageReactions"]
});
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    setInterval(() => {
        switch (count) {
            case 0:
                client.user.setActivity({
                    name: "your new year's resolutions",
                    type: discord_js_1.ActivityType.Watching
                });
                count++;
                break;
            case 1:
                client.user.setActivity({
                    name: "to your thoughts about " + process.env.COUNTDOWN_YEAR,
                    type: discord_js_1.ActivityType.Listening
                });
                count++;
                break;
            case 2:
                client.user.setActivity({
                    name: `${client.guilds.cache.size} servers say Happy New Year!`,
                    type: discord_js_1.ActivityType.Listening
                });
                count = 0;
                break;
        }
    }, 9000);
    require("./utils/database").connect();
    console.log(`Online in ${client.guilds.cache.size} guilds`);
    require("./utils/commands")(client);
    require("./utils/countdownUpdater")(client);
    client.on("guildCreate", (guild) => {
        console.log("Total guilds:" + client.guilds.cache.size);
        const logsWebhook = new discord_js_1.WebhookClient({ url: process.env.LOGS_WEBHOOK });
        logsWebhook.send({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({ name: "Joined New Guild" })
                    .setDescription(`Joined guild: ${guild.name} (${guild.id})`)
                    .setTimestamp()
                    .setColor("Green")
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: `Now in ${client.guilds.cache.size} guilds` })
            ]
        });
    });
    client.on("guildDelete", (guild) => {
        console.log("Total guilds:" + client.guilds.cache.size);
        const logsWebhook = new discord_js_1.WebhookClient({ url: process.env.LOGS_WEBHOOK });
        logsWebhook.send({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({ name: "Removed From Guild" })
                    .setDescription(`Removed from guild: ${guild.name} (${guild.id})`)
                    .setTimestamp()
                    .setColor("Red")
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: `Now in ${client.guilds.cache.size} guilds` })
            ]
        });
    });
    // Update Commands (Customize to suit your needs)
    if (process.env.REGISTER_COMMANDS === "true") {
        (0, registerCommands_1.default)({
            testMode: true,
            deletePreviousCommands: true,
            onlyDelete: true
        });
    }
}));
client.login(process.env.TOKEN);
