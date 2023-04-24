import { ChatInterface } from "../Interfaces/ChatInterface";
import { ChatManagerInterface } from "../Interfaces/ChatManagerInterface";
import { LocalChat } from "./Chat";

interface ChatsInterface {
    [key: string]: ChatInterface;
}

export class ChatManager implements ChatManagerInterface {
    protected chats: ChatsInterface = {};

    public getChatByNumber(phone: string): ChatInterface | undefined {
        return this.chats[phone];
    }

    public addChat(phone: string, chat: ChatInterface): ChatInterface {
        this.chats[phone] = chat;

        return this.chats[phone];
    }

    public removeChat(phone: string): void {
        delete this.chats[phone];
    }
}
