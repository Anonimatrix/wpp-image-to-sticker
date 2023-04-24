import { ChatInterface } from "../Interfaces/ChatInterface";
import { ChatManagerInterface } from "../Interfaces/ChatManagerInterface";
import { ChatModel } from "../../../models/models";
import { services } from "../../../config/services";

interface ChatsInterface {
    [key: string]: ChatInterface;
}

export class DbChatManager implements ChatManagerInterface {
    protected chats: ChatsInterface = {};

    public async getChatByNumber(
        phone: string
    ): Promise<ChatInterface | undefined> {
        const chat = ChatModel.findOne({ phone });

        if (!chat) return undefined;

        return new services.chat(chat.phone);
    }

    public async addChat(phone: string): Promise<ChatInterface> {
        const savedChat = await ChatModel.create({ phone });

        return new services.chat(savedChat.phone);
    }

    public async removeChat(phone: string): Promise<void> {
        await ChatModel.findOne({ phone }).remove();
    }
}
