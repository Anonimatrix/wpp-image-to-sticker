import axios from "axios";
import { ResponseManagerInterface } from "../Interfaces/ResponseManager";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import { Readable, PassThrough } from "stream";

export class ConverterManager implements ResponseManagerInterface {
    async getResponse(messages: string[]) {
        const res = await axios.get(messages[0], {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        });

        const outputBuffer = await this.bufferJpgToWebp(Buffer.from(res.data));

        return outputBuffer;
    }

    async bufferJpgToWebp(buffer: Buffer) {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const outputStream = new PassThrough();

        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .videoCodec("libwebp")
                .toFormat("webp")
                .setSize("512x512")
                .autoPad(true)
                .on("error", (err) => {
                    console.log("An error occurred: " + err.message);
                    reject(err);
                })
                .on("end", function () {
                    resolve("");
                })
                .pipe(outputStream);
        });

        const outputBuffer: Buffer = await new Promise((resolve, reject) => {
            const buffers: any[] = [];

            outputStream.on("data", (data) => {
                buffers.push(data);
            });

            outputStream.on("error", (err) => {
                reject(err);
            });

            outputStream.on("close", () => {
                console.log("END");
                resolve(Buffer.concat(buffers));
            });
        });

        return outputBuffer;
    }
}
