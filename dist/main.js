"use strict";
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
client.once("ready", () => {
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
    // Update Commands (Customize to suit your needs)
    if (process.env.REGISTER_COMMANDS === "true") {
        (0, registerCommands_1.default)({
            testMode: false,
            deletePreviousCommands: true,
            onlyDelete: false
        });
    }
});
client.login(process.env.TOKEN);
