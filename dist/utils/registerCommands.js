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
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function registerCommands(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options || options.testMode == undefined) {
            throw new Error("Options are required when registering slash commands.");
        }
        const commands = [];
        const commandsPath = node_path_1.default.join(__dirname, "../commands");
        const commandFiles = node_fs_1.default
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            commands.push(command.init().toJSON());
        }
        const CLIENT_ID = process.env.CLIENT_ID;
        const TEST_GUILD_ID = process.env.TEST_GUILD_ID;
        const TOKEN = process.env.TOKEN;
        const rest = new discord_js_1.REST({ version: "10" }).setToken(TOKEN);
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            if (options.testMode) {
                if (options.deletePreviousCommands) {
                    yield rest
                        .put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: []
                    })
                        .then(() => console.log("Successfully deleted all guild commands."))
                        .catch(console.error);
                }
                if (!options.onlyDelete) {
                    const data = yield rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), { body: commands });
                    console.log(`Successfully reloaded ${data.length} application guild (/) commands.`);
                }
            }
            else {
                if (options.deletePreviousCommands) {
                    yield rest
                        .put(discord_js_1.Routes.applicationCommands(CLIENT_ID), { body: [] })
                        .then(() => console.log("Successfully deleted all application commands."))
                        .catch(console.error);
                }
                if (!options.onlyDelete) {
                    const data = yield rest.put(discord_js_1.Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    });
                    console.log(`Successfully reloaded ${data.length} application client (/) commands.`);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = registerCommands;
