import { Schema, model } from "mongoose"

const GuildSchema = new Schema({
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
})

export default model("guilds", GuildSchema)
