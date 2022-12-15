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
exports.generateCountdown = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const constants_1 = require("./constants");
const timezoneManager_1 = require("./timezoneManager");
function generateCountdown(client, timezone) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const timeUntilNewYear = (0, timezoneManager_1.getTimeUntilNewYear)(timezone);
        const COUNTDOWN_YEAR = process.env.COUNTDOWN_YEAR;
        // Days
        let days = "" + timeUntilNewYear.days;
        if (timeUntilNewYear.days === 1)
            days += " day";
        else if (timeUntilNewYear.days < 1)
            days = "Less than a day";
        else
            days += " days";
        // Hours
        let hours = "" + timeUntilNewYear.hours;
        if (timeUntilNewYear.hours === 1)
            hours += " hour";
        else if (timeUntilNewYear.hours < 1)
            hours = "Less than an hour";
        else
            hours += " hours";
        // Minutes
        let minutes = "" + timeUntilNewYear.minutes;
        if (timeUntilNewYear.minutes === 1)
            minutes += " minute";
        else if (timeUntilNewYear.minutes < 1)
            minutes = "Less than a minute";
        else
            minutes += " minutes";
        // Seconds
        let seconds = "" + timeUntilNewYear.seconds;
        if (timeUntilNewYear.seconds === 1)
            seconds += " second";
        else if (timeUntilNewYear.seconds < 1)
            seconds = "Less than a second";
        else
            seconds += " seconds";
        if (timeUntilNewYear.seconds < 8)
            return yield new builders_1.EmbedBuilder()
                .setAuthor({
                name: `Happy New Year! ${COUNTDOWN_YEAR} is here!`,
                iconURL: (_a = client.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL()
            })
                .setColor(discord_js_1.Colors.White)
                .setFooter({
                text: "New Year Countdown",
                iconURL: (_b = client.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL()
            })
                .setImage(constants_1.countdownGif)
                .setTimestamp();
        return yield new builders_1.EmbedBuilder()
            .setAuthor({
            name: `${COUNTDOWN_YEAR} is in...`,
            iconURL: (_c = client.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL()
        })
            .setDescription(`**${days}** or\n**${hours}** or\n**${minutes}** or\n**${seconds}**\n\nTimezone set to: \`${timezone}\``)
            .setColor(discord_js_1.Colors.White)
            .setFooter({
            text: "New Year Countdown",
            iconURL: (_d = client.user) === null || _d === void 0 ? void 0 : _d.displayAvatarURL()
        })
            .setTimestamp()
            .setThumbnail("https://c.tenor.com/PXfDMQ8dxaEAAAAi/nemzeti%C3%BCnnep-fireworks.gif");
    });
}
exports.generateCountdown = generateCountdown;
