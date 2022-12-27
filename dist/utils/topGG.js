"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { AutoPoster } = require("topgg-autoposter");
module.exports = (client) => {
    const topGGToken = process.env.TOPGG_TOKEN;
    if (!topGGToken)
        return;
    const ap = AutoPoster(topGGToken, client);
    ap.on("posted", () => {
        console.log("Posted stats to Top.gg!");
    });
};
