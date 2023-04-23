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

        //Set the crop query
        const minSize = "min(iw, ih)";
        const cropQuery = `crop='${minSize}':'${minSize}':'if(gte(ih, iw), 0, iw / 2 - ${minSize} / 2)':'if(gte(iw, ih), 0,  ih / 2 - ${minSize} / 2)'`;

        // Create a webp file in output stream
        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .withVideoCodec("libwebp")
                .withOptions([
                    "-loop 0",
                    "-lossless 0",
                    "-preset default",
                    "-compression_level 6",
                    "-q:v 40",
                    "-an",
                    "-vsync 2",
                ])
                .videoBitrate("128k")
                .outputFps(4)
                .videoFilters(cropQuery)
                .setSize("512x512")
                .toFormat("webp")
                .on("start", (commandLine) => console.log(commandLine))
                .on("progess", (progress) => console.log(progress))
                .on("error", (err) => {
                    console.log("An error occurred: " + err.message);
                    reject(err);
                })
                .on("end", function () {
                    resolve("");
                })
                .pipe(outputStream, { end: true });
        });

        //Then convert the webp file to a buffer
        const outputBuffer: Buffer = await new Promise((resolve, reject) => {
            const buffers: any[] = [];

            outputStream.on("data", (data) => {
                buffers.push(data);
            });

            outputStream.on("error", (err) => {
                reject(err);
            });

            outputStream.on("close", () => {
                resolve(Buffer.concat(buffers));
            });
        });

        return outputBuffer;
    }
}
