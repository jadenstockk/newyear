"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GuildSchema = new mongoose_1.Schema({
    guildId: {
        unique: true,
        required: true,
        type: String
    },
    timezone: {
        type: String,
        default: "America/New_York"
    },
    countdown: {
        channelId: {
            type: String,
            default: null
        },
        messageId: {
            type: String,
            default: null
        },
        completed: {
            type: Boolean,
            default: false
        }
    }
});
exports.default = (0, mongoose_1.model)("guilds", GuildSchema);
