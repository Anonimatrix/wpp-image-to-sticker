import { mongoose } from "@typegoose/typegoose";
import { DbInterface } from "./Interfaces/Db";

export class MongoDbService implements DbInterface {
    async init() {
        await mongoose.connect(process.env.MONGO_URI || "");
    }
}
