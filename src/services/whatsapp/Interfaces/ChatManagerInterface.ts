import { ChatInterface } from "./ChatInterface";

export interface ChatManagerInterface {
    getChatByNumber(
        phone: string
    ): ChatInterface | undefined | Promise<ChatInterface> | Promise<undefined>;
    addChat(
        phone: string,
        chat?: ChatInterface
    ): ChatInterface | Promise<ChatInterface>;
    removeChat(phone: string): void | Promise<void>;
}
