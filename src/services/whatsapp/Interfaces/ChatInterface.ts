import { MessageInterface } from "./MessageInterface";

export interface ChatInterface {
    readonly phone: string;

    getMessages(): MessageInterface[] | Promise<MessageInterface[]>;

    addMessage(message: MessageInterface): void | Promise<void>;

    getLastMessage():
        | MessageInterface
        | undefined
        | Promise<MessageInterface | undefined>;
}
