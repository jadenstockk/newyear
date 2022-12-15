"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeUntilNewYear = exports.getValidTimezone = exports.checkTimezoneValid = void 0;
const timezones = require("./timezones.json");
const cityTimezone = require("city-country-timezone");
const spacetime_1 = __importDefault(require("spacetime"));
// Check if a timezone is valid and then return it
function checkTimezoneValid(input) {
    const timezone = timezones.find((tz) => tz.toLowerCase() === input.toLowerCase().replace(/\s/g, "_"));
    return timezone;
}
exports.checkTimezoneValid = checkTimezoneValid;
// Convert country, city, or timezone to a valid timezone
function getValidTimezone(input) {
    var _a;
    let result = ((_a = cityTimezone(input)) === null || _a === void 0 ? void 0 : _a.timezone) || checkTimezoneValid(input);
    return result;
}
exports.getValidTimezone = getValidTimezone;
// Get the time until New Year according to the timezone
function getTimeUntilNewYear(timezone) {
    const COUNTDOWN_YEAR = process.env.COUNTDOWN_YEAR;
    const now = spacetime_1.default.now(timezone);
    const newYear = (0, spacetime_1.default)(`${COUNTDOWN_YEAR}-01-01`, timezone);
    // FOR TESTING const newYear = spacetime(`${COUNTDOWN_YEAR - 1}-1-1`, timezone)
    const timeUntilNewYear = now.diff(newYear);
    return timeUntilNewYear;
}
exports.getTimeUntilNewYear = getTimeUntilNewYear;
