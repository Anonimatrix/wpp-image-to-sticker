import { Message } from "./Message";
import { getModelForClass, prop, Ref } from "@typegoose/typegoose";

export class Chat {
    @prop({ required: true, unique: true })
    public phone!: string;

    @prop({ ref: () => Message, default: [] })
    public messages?: Ref<Message>[];
}
