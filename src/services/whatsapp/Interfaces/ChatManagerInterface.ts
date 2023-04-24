import { ChatInterface } from "./ChatInterface";

export interface ChatManagerInterface {
    getChatByNumber(phone: string): ChatInterface | undefined;
    addChat(phone: string, chat: ChatInterface): ChatInterface;
    removeChat(phone: string): void;
}
