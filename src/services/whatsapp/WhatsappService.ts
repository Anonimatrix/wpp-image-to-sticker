import axios, { AxiosError } from "axios";
import FormData, { Readable } from "form-data";
import { ReadStream } from "fs";

export class WhatsappService {
    protected readonly commandPrefix: string = "@";

    verificateToken(mode: string, token: string): boolean {
        const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;

        if (mode && token) {
            // Check the mode and token sent are correct
            if (mode === "subscribe" && token === verify_token) {
                return true;
            }
        }

        return false;
    }

    isValidMessage(entry: any) {
        return Boolean(
            entry &&
                entry[0].changes &&
                entry[0].changes[0] &&
                entry[0].changes[0].value.messages &&
                entry[0].changes[0].value.messages[0]
        );
    }

    async parseMessage(entry: any) {
        const change = entry[0].changes[0].value;
        const phone_number_id = change.metadata.phone_number_id;
        const message = change.messages[0];

        const from = message.from.replace("549", "54");

        const msg_body = message.text?.body || "";

        const image_id = message.image?.id || "";

        const media_url = image_id ? await this.getMediaUrl(image_id) : "";

        return {
            phone_number_id,
            from,
            msg_body,
            media_url,
        };
    }

    isCommand(msg_body: string) {
        return msg_body.startsWith(this.commandPrefix);
    }

    async getMediaUrl(media_id: string) {
        const res = await axios.get(
            `https://graph.facebook.com/v16.0/${media_id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                },
            }
        );

        const media_link = res.data.url;

        return media_link;
    }

    async getMedia(media_url: string) {
        const res = await axios.get(media_url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
            responseType: "arraybuffer",
        });

        return Buffer.from(res.data, "binary");
    }

    async sendMessage(phone: string, message: string, type: string = "text") {
        let extraData = this.getBodyMessage(message, type);

        try {
            return await axios.post(
                `https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: phone,
                    type,
                    ...extraData,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    },
                }
            );
        } catch (e) {
            const msgError =
                e instanceof AxiosError
                    ? e.response?.data?.error.message
                    : e instanceof Error
                    ? e.message
                    : "Unknown error";

            throw new Error(msgError);
        }
    }

    protected getBodyMessage(msg_body: string, type = "text") {
        let extraData: { [key: string]: object } = {};
        if (type === "sticker") {
            extraData[type] = {
                id: msg_body,
            };
        } else {
            extraData[type] = {
                body: msg_body,
                preview_url: true,
            };
        }

        return extraData;
    }

    getCommandPrefix() {
        return this.commandPrefix;
    }

    async uploadSticker(sticker: Readable | Buffer | ReadStream) {
        const formdata = new FormData();
        formdata.append("messaging_product", "whatsapp");
        formdata.append("file", sticker, { filename: "sticker.webp" });

        try {
            const res = await axios.post(
                `https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/media`,
                formdata,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                        ...formdata.getHeaders(),
                    },
                }
            );

            return res.data.id;
        } catch (e) {
            const msgError =
                e instanceof AxiosError
                    ? e.response?.data?.error.message
                    : e instanceof Error
                    ? e.message
                    : "Unknown error";

            throw new Error(msgError);
        }
    }
}
