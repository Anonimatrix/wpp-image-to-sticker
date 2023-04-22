import axios from "axios";
import { ResponseManagerInterface } from "../Interfaces/ResponseManager";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Transform } from "stream";

export class ConverterManager implements ResponseManagerInterface {
    async getResponse(messages: string[]) {
        const res = await axios.get(messages[0], {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        });

        const buffer = res.data;

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const outputStream = ffmpeg(stream).format("webp").pipe();

        const outputBuffer: Buffer = await new Promise((resolve, reject) => {
            const buffers: any[] = [];

            outputStream.on("data", (data) => {
                buffers.push(data);
                console.log(data);
            });

            outputStream.on("end", () => {
                resolve(Buffer.concat(buffers));
            });

            outputStream.on("error", (err) => {
                reject(err);
            });
        });

        return outputBuffer.toString("utf-8");
    }
}
