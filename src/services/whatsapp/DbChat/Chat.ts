import { MessageInterface } from "../Interfaces/MessageInterface";
import { ChatInterface } from "../Interfaces/ChatInterface";
import { ChatModel, MessageModel } from "../../../models/models";
import { Message } from "../../../models/Message";
import { isDocumentArray } from "@typegoose/typegoose";
import { mongoose } from "@typegoose/typegoose";

export class DbChat implements ChatInterface {
    public phone: string;

    constructor(phone: string) {
        this.phone = phone;
    }

    public async getMessages(): Promise<MessageInterface[]> {
        const chat = await ChatModel.findOne({ phone: this.phone });

        if (!chat) throw new Error("Chat not found");

        await chat.populate("messages");

        if (isDocumentArray(chat.messages)) {
            return chat.messages.map((message: Message) => ({
                body: message.content,
            }));
        }

        return [];
    }

    public async addMessage(message: MessageInterface): Promise<void> {
        const chat = await ChatModel.findOne({ phone: this.phone });

        if (!chat) throw new Error("Chat not found");

        const savedMessage = await MessageModel.create({
            content: message.body,
            chat: chat._id,
        });

        await ChatModel.updateOne(
            { phone: this.phone },
            {
                $push: {
                    messages: savedMessage._id,
                },
            }
        );
    }

    public async getLastMessage(): Promise<MessageInterface | undefined> {
        const message = await MessageModel.findOne({ chat: this.phone }).sort({
            createdAt: -1,
        });

        return {
            body: message?.content || "",
        };
    }
}
