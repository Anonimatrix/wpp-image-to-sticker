import axios from "axios";
import { ResponseManagerInterface } from "../Interfaces/ResponseManager";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import { Readable, PassThrough } from "stream";
import md5 from "md5";
import { join } from "path";
import { readFileSync, rmSync } from "fs";

export class ConverterManager implements ResponseManagerInterface {
    async getResponse(messages: string[]) {
        const res = await axios.get(messages[0], {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        });

        const outputBuffer = await this.bufferMediaToWebp(
            Buffer.from(res.data)
        );

        return outputBuffer;
    }

    async bufferMediaToWebp(buffer: Buffer, type = "image") {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const outputStream = new PassThrough();

        //Set the crop query
        const minSize = "min(iw, ih)";
        const cropQuery = `crop='${minSize}':'${minSize}':'if(gte(ih, iw), 0, iw / 2 - ${minSize} / 2)':'if(gte(iw, ih), 0,  ih / 2 - ${minSize} / 2)'`;

        //Create a md5 filename with ffmpeg
        const filename = md5(buffer.toString("binary"));
        const path = join(__dirname, "tmp", filename + ".webp");

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
                    "-fs 80k",
                ])
                .videoBitrate("128k")
                .videoFilters(type == "image" ? cropQuery : "")
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
                .saveToFile(path);
        });

        const outputBuffer = readFileSync(path);
        rmSync(path);

        return outputBuffer;
    }
}
