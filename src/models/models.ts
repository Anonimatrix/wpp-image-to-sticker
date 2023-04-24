import { getModelForClass } from "@typegoose/typegoose";
import { Chat } from "./Chat";
import { Message } from "./Message";

export const ChatModel = getModelForClass(Chat);
export const MessageModel = getModelForClass(Message);
