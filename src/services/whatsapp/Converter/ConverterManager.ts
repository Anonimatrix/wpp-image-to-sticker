import axios from "axios";
import { ResponseManagerInterface } from "../Interfaces/ResponseManager";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import { Readable } from "stream";

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

        const outputStream = ffmpeg(stream)
            .format("webp")
            .pipe()
            .on("error", function (err) {
                console.log("An error occurred: " + err.message);
            });

        const outputBuffer: Buffer = await new Promise((resolve, reject) => {
            const buffers: any[] = [];

            outputStream.on("data", (data) => {
                buffers.push(data);
            });

            outputStream.on("end", () => {
                resolve(Buffer.concat(buffers));
                outputStream.destroy();
                console.log("END");
            });
        });

        return outputBuffer;
    }
}
