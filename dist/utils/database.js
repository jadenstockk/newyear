"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
module.exports = {
    connect: () => {
        mongoose_1.default.set("strictQuery", true);
        mongoose_1.default
            .connect(process.env.MONGO_URL)
            .then(() => {
            console.log("Connected to Database!");
        })
            .catch((err) => {
            console.error(err);
        });
    }
};
