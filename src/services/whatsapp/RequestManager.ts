import { invalidFormatMessage, welcomeMessage } from "../../config/messages";
import { services } from "../../config/services";
import { RequestManagerInterface } from "./Interfaces/RequestManager";

export class RequestManager implements RequestManagerInterface {
    async manage(entry: any) {
        // Checking if the message is valid and returning a 400 if it is not
        if (!services.wpp.isValidMessage(entry)) {
            return 400;
        }

        // Parsing all information from the message
        const { from, media_url, msg_body } = await services.wpp.parseMessage(
            entry
        );

        if (!(await services.chatManager.getChatByNumber(from))) {
            await services.chatManager.addChat(from);

            await services.wpp.sendMessage(from, welcomeMessage, "text");
        } else if (!media_url) {
            await services.wpp.sendMessage(from, invalidFormatMessage);
            return 400;
        }

        try {
            // Getting the response from the message
            const response = await services.responseManager.getResponse([
                media_url,
                msg_body,
            ]);

            if (response instanceof Buffer) {
                // Uploading the sticker
                const id = await services.wpp.uploadSticker(response);

                // Sending the response
                await services.wpp.sendMessage(from, id, "sticker");
            }
        } catch (e) {
            throw e;
        }

        return 200;
    }
}
