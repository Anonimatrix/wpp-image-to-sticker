import { ExpressServer } from "../services/server/ExpressServer";
import { ServerInterface } from "../services/server/Interfaces/ServerInterface";
import { ChatManager } from "../services/whatsapp/LocalChat/ChatManager";
import { ChatManagerInterface } from "../services/whatsapp/Interfaces/ChatManagerInterface";
import { WhatsappService } from "../services/whatsapp/WhatsappService";
import { RequestManager } from "../services/whatsapp/RequestManager";
import { RequestManagerInterface } from "../services/whatsapp/Interfaces/RequestManager";
import { ResponseManagerInterface } from "../services/whatsapp/Interfaces/ResponseManager";
import { ConverterManager } from "../services/Converter/ConverterManager";

interface ServicesInterface {
    server: ServerInterface;
    wpp: WhatsappService;
    chatManager: ChatManagerInterface;
    responseManager: ResponseManagerInterface;
    requestManager: RequestManagerInterface;
}

export const services: ServicesInterface = {
    server: new ExpressServer(),
    wpp: new WhatsappService(),
    chatManager: new ChatManager(),
    responseManager: new ConverterManager(),
    requestManager: new RequestManager(),
};
