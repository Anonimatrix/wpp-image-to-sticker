import { ExpressServer } from "../services/server/ExpressServer";
import { ServerInterface } from "../services/server/Interfaces/ServerInterface";
import { ChatManager } from "../services/whatsapp/LocalChat/ChatManager";
import { ChatManagerInterface } from "../services/whatsapp/Interfaces/ChatManagerInterface";
import { WhatsappService } from "../services/whatsapp/WhatsappService";
import { RequestManager } from "../services/whatsapp/RequestManager";
import { RequestManagerInterface } from "../services/whatsapp/Interfaces/RequestManager";
import { ResponseManagerInterface } from "../services/whatsapp/Interfaces/ResponseManager";
import { ConverterManager } from "../services/Converter/ConverterManager";
import { DbInterface } from "../services/db/Interfaces/Db";
import { MongoDbService } from "../services/db/MongoDbService";
import { ChatInterface } from "../services/whatsapp/Interfaces/ChatInterface";
import { DbChat } from "../services/whatsapp/DbChat/Chat";
import { DbChatManager } from "../services/whatsapp/DbChat/ChatManager";

interface ServicesInterface {
    server: ServerInterface;
    wpp: WhatsappService;
    chatManager: ChatManagerInterface;
    responseManager: ResponseManagerInterface;
    requestManager: RequestManagerInterface;
    db: DbInterface;
    // Constructor type of ChatInterface
    chat: new (phone: string) => ChatInterface;
}

export const services: ServicesInterface = {
    server: new ExpressServer(),
    wpp: new WhatsappService(),
    chatManager: new DbChatManager(),
    responseManager: new ConverterManager(),
    requestManager: new RequestManager(),
    db: new MongoDbService(),
    chat: DbChat,
};
