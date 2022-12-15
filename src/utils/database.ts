import mongoose from "mongoose"

module.exports = {
	connect: () => {
		mongoose.set("strictQuery", true)
		mongoose
			.connect(process.env.MONGO_URL!)
			.then(() => {
				console.log("Connected to Database!")
			})
			.catch((err) => {
				console.error(err)
			})
	}
}
