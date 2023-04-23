import axios from "axios";
import { ResponseManagerInterface } from "../Interfaces/ResponseManager";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import { Readable, PassThrough } from "stream";
import md5 from "md5";
import { join, parse } from "path";
import { readFileSync, rmSync, mkdirSync } from "fs";
import { ConverterOptions } from "./Interfaces/ConverterOptions";

export class ConverterManager implements ResponseManagerInterface {
    /**
     * @param messages - First message is the media url and the second is the message body
     */
    async getResponse(messages: string[]) {
        const res = await axios.get(messages[0], {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        });

        const msg_body = messages[1];
        // Convert message to options
        const options = [...msg_body.matchAll(/(\w+)=(\w+)/g)];
        //Getting options
        const parsedOptions = options.reduce((acc, curr) => {
            (acc as any)[curr[1]] = curr[2];
            return acc;
        }, {});

        const outputBuffer = await this.bufferMediaToWebp(
            Buffer.from(res.data),
            parsedOptions
        );

        return outputBuffer;
    }

    async bufferMediaToWebp(buffer: Buffer, options: ConverterOptions = {}) {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        //Set the crop query
        const minSize = "min(iw, ih)";
        const cropQuery = `crop='${minSize}':'${minSize}':'if(gte(ih, iw), 0, iw / 2 - ${minSize} / 2)':'if(gte(iw, ih), 0,  ih / 2 - ${minSize} / 2)'`;

        if (options.speed) {
            options.speed = options.speed < 0 ? 1 : options.speed;
        }

        let speedQuery = options.speed ? `setpts=PTS/${options.speed}` : "";

        //Create a md5 filename with ffmpeg
        const filename = md5(buffer.toString("binary"));
        const path = join(__dirname, "tmp", filename + ".webp");

        const parsedPath = parse(path);

        mkdirSync(parsedPath.dir, { recursive: true });

        const videoFilters: string[] = [];

        if (speedQuery) videoFilters.push(speedQuery);
        if (cropQuery) videoFilters.push(cropQuery);

        // Create a webp file in output stream
        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .withVideoCodec("libwebp")
                .withOptions([
                    "-loop 0",
                    "-lossless 0",
                    "-preset icon",
                    "-compression_level 12",
                    "-q:v 7",
                    "-an",
                    "-vsync 1",
                    "-fs 450k",
                ])
                .videoBitrate("16k")
                .videoFilters(videoFilters.join(","))
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
