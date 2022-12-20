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
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const logError_1 = __importDefault(require("./logError"));
module.exports = (client) => {
    let commands = new discord_js_1.Collection();
    const commandsPath = node_path_1.default.join(__dirname, "../commands");
    const commandFiles = node_fs_1.default
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
    for (const file of commandFiles) {
        const filePath = node_path_1.default.join(commandsPath, file);
        const command = require(filePath);
        if ("init" in command && "execute" in command) {
            commands.set(command.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "init" or "execute" property.`);
        }
    }
    client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!interaction.isChatInputCommand())
            return;
        let command = commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            yield command.execute(interaction);
        }
        catch (err) {
            console.error(err);
            (0, logError_1.default)(err || "Unknown error in commands", "Command Handler: " + (command.name || "Unknown Command"));
            yield interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor("Red")
                        .setAuthor({
                        name: `Uh oh! Something went wrong.`,
                        iconURL: (_a = client.emojis.cache.get(constants_1.crossEmoji)) === null || _a === void 0 ? void 0 : _a.url
                    })
                        .setDescription("Please try again or join our support server for assistance")
                ],
                components: [
                    new builders_1.ActionRowBuilder().addComponents(new builders_1.ButtonBuilder()
                        .setLabel("Join Support Server")
                        .setURL("https://discord.gg/4C5BQRm7uE")
                        .setStyle(discord_js_1.ButtonStyle.Link))
                ],
                ephemeral: true
            });
        }
    }));
};
