import { Ref, prop } from "@typegoose/typegoose";
import { Chat } from "./Chat";

export class Message {
    @prop({ required: true })
    content!: string;

    @prop({ ref: () => Chat, required: true })
    chat!: Ref<Chat>;

    @prop({ required: true })
    createdAt!: Date;
}
