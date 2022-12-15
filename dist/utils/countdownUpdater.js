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
const timezoneManager_1 = require("./timezoneManager");
module.exports = (client) => {
    setTimeout(() => {
        setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Updating countdowns... | " +
                spacetime_1.default.now("Africa/Johannesburg").format("nice"));
            try {
                const guilds = yield Guild_1.default.find();
                guilds.forEach((data) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a;
                    if (!data.guildId ||
                        !data.countdown ||
                        !data.countdown.channelId ||
                        data.countdown.completed)
                        return;
                    const guild = client.guilds.cache.get(data.guildId);
                    if (!guild) {
                        return;
                    }
                    const ch = yield guild.channels.fetch(data.countdown.channelId);
                    if (!ch || ch.type !== discord_js_1.ChannelType.GuildText) {
                        data.countdown = undefined;
                        return yield data.save().catch((err) => console.log(err));
                    }
                    const msgs = yield ch.messages.fetch();
                    const message = yield ((_a = msgs
                        .get(data.countdown.messageId)) === null || _a === void 0 ? void 0 : _a.edit({
                        embeds: [yield (0, countdownGenerator_1.generateCountdown)(client, data.timezone)]
                    }).catch((err) => console.log(err)));
                    // Generate the countdown message
                    const countdown = yield (0, countdownGenerator_1.generateCountdown)(client, data.timezone);
                    if (!message) {
                        // Send the initial countdown message and update the guild data
                        const msg = yield ch.send({ embeds: [countdown] });
                        data.countdown = {
                            channelId: ch.id,
                            messageId: msg.id,
                            completed: false
                        };
                        yield data.save().catch((err) => console.log(err));
                        yield msg.pin();
                    }
                    else {
                        // Update the countdown message
                        const msg = yield message.edit({ embeds: [countdown] });
                        data.countdown = {
                            channelId: ch.id,
                            messageId: msg.id,
                            completed: false
                        };
                        yield data.save();
                        yield msg.pin();
                    }
                    if ((0, timezoneManager_1.getTimeUntilNewYear)(data.timezone).seconds < 8) {
                        data.countdown.completed = true;
                        yield data.save();
                    }
                }));
            }
            catch (err) {
                console.error("Countdown Update Error", err);
            }
        }), 60000);
    }, 60000 - (new Date().getTime() % 60000));
};
