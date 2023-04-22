import { config } from "../../config/chats";
import { services } from "../../config/services";
import { RequestManagerInterface } from "./Interfaces/RequestManager";

export class RequestManager implements RequestManagerInterface {
    async manage(entry: any) {
        // Checking if the message is valid and returning a 400 if it is not
        if (!services.wpp.isValidMessage(entry)) {
            return 400;
        }

        // Parsing all information from the message
        const { from, media_url } = await services.wpp.parseMessage(entry);

        if (!media_url) {
            return 400;
        }

        // Getting the chat by the phone number
        const chat =
            services.chatManager.getChatByNumber(from) ||
            services.chatManager.addChat(from);

        //Adding message and setting the timeout to remove chat if the timeout is reached
        chat.addMessage({ body: media_url }, async () => {
            await services.wpp.sendMessage(from, config.timeoutMessage);
            services.chatManager.removeChat(from);
        });

        try {
            // Getting the response from the message
            const response = await services.responseManager.getResponse([
                media_url,
            ]);

            // Sending the response
            await services.wpp.sendMessage(from, response, "sticker");
        } catch (e) {
            throw e;
        }

        return 200;
    }
}
