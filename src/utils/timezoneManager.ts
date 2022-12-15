const timezones: string[] = require("./timezones.json")
const cityTimezone = require("city-country-timezone")
import spacetime from "spacetime"

// Check if a timezone is valid and then return it
export function checkTimezoneValid(input: string) {
	const timezone = timezones.find(
		(tz) => tz.toLowerCase() === input.toLowerCase().replace(/\s/g, "_")
	)

	return timezone
}

// Convert country, city, or timezone to a valid timezone
export function getValidTimezone(input: string) {
	let result = cityTimezone(input)?.timezone || checkTimezoneValid(input)

	return result
}

// Get the time until New Year according to the timezone
export function getTimeUntilNewYear(timezone: string) {
	const COUNTDOWN_YEAR = process.env.COUNTDOWN_YEAR!

	const now = spacetime.now(timezone)
	const newYear = spacetime(`${COUNTDOWN_YEAR}-01-01`, timezone)
	// FOR TESTING const newYear = spacetime(`${COUNTDOWN_YEAR - 1}-1-1`, timezone)

	const timeUntilNewYear = now.diff(newYear)

	return timeUntilNewYear
}
