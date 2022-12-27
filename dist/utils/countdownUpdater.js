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
const spacetime_1 = __importDefault(require("spacetime"));
const Guild_1 = __importDefault(require("../models/Guild"));
const countdownGenerator_1 = require("./countdownGenerator");
const logError_1 = __importDefault(require("./logError"));
const timezoneManager_1 = require("./timezoneManager");
module.exports = (client) => {
    let test = false;
    function update() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Updating countdowns... | " +
                spacetime_1.default.now("Africa/Johannesburg").format("nice"));
            try {
                const guilds = yield Guild_1.default.find();
                guilds.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d;
                    if (!data.guildId ||
                        !data.countdown ||
                        !data.countdown.channelId ||
                        data.countdown.completed)
                        return;
                    const guild = client.guilds.cache.get(data.guildId);
                    if (!guild) {
                        return;
                    }
                    if (!guild.channels.cache.get(data.countdown.channelId))
                        return;
                    const ch = yield ((_a = guild === null || guild === void 0 ? void 0 : guild.channels) === null || _a === void 0 ? void 0 : _a.fetch(data.countdown.channelId));
                    if (!ch || ch.type !== discord_js_1.ChannelType.GuildText) {
                        data.countdown = undefined;
                        return yield data.save();
                    }
                    if (!((_b = ch
                        .permissionsFor(guild.members.me)) === null || _b === void 0 ? void 0 : _b.has(discord_js_1.PermissionFlagsBits.SendMessages &&
                        discord_js_1.PermissionFlagsBits.EmbedLinks &&
                        discord_js_1.PermissionFlagsBits.ViewChannel)))
                        return;
                    const msgs = yield ((_c = ch === null || ch === void 0 ? void 0 : ch.messages) === null || _c === void 0 ? void 0 : _c.fetch().catch((err) => console.log(err)));
                    if (!msgs)
                        return;
                    const message = yield ((_d = msgs.get(data.countdown.messageId)) === null || _d === void 0 ? void 0 : _d.edit({
                        embeds: [yield (0, countdownGenerator_1.generateCountdown)(client, data.timezone)]
                    }));
                    // Generate the countdown message
                    const countdown = yield (0, countdownGenerator_1.generateCountdown)(client, data.timezone);
                    if (!message) {
                        // Send the initial countdown message and update the guild data
                        const msg = yield ch
                            .send({ embeds: [countdown] })
                            .catch((err) => console.log(err));
                        if (!msg)
                            return;
                        data.countdown = {
                            channelId: ch.id,
                            messageId: msg.id,
                            completed: false
                        };
                        yield data.save();
                        yield msg
                            .pin()
                            .catch(() => console.log("Failed to pin countdown message"));
                    }
                    else {
                        // Update the countdown message
                        const msg = yield message.edit({ embeds: [countdown] });
                        if (!msg)
                            return;
                        data.countdown = {
                            channelId: ch.id,
                            messageId: msg.id,
                            completed: false
                        };
                        yield data.save();
                        yield msg
                            .pin()
                            .catch(() => console.log("Failed to pin countdown message"));
                    }
                    if ((0, timezoneManager_1.getTimeUntilNewYear)(data.timezone).seconds < 8) {
                        data.countdown.completed = true;
                        yield data.save();
                    }
                }));
            }
            catch (err) {
                console.error("Countdown Update Error", err);
                (0, logError_1.default)(err || "Unknown error in countdown updater baseline", "Countdown Updater Baseline");
            }
        });
    }
    setTimeout(() => {
        if (test) {
            update();
        }
        setInterval(() => {
            update();
        }, test ? 20000 : 60000);
    }, test ? 0 : 60000 - (new Date().getTime() % 60000));
};
