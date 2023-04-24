import { ResponseManagerInterface } from "../whatsapp/Interfaces/ResponseManager";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import { Readable } from "stream";
import md5 from "md5";
import { join, parse } from "path";
import { readFileSync, rmSync, mkdirSync } from "fs";
import { ConverterOptions } from "./Interfaces/ConverterOptions";
import { services } from "../../config/services";
import {
    cropQuery,
    optionsOutputQueries,
    optionsVideoQueries,
    outputOptions,
    regexOption,
} from "../../config/converter";

export class ConverterManager implements ResponseManagerInterface {
    /**
     * @param messages - First message is the media url and the second is the message body
     */
    async getResponse(messages: string[]) {
        const wppService = services.wpp;

        const media_url = messages[0];
        const msg_body = messages[1];

        const file = await wppService.getMedia(media_url);

        // Convert message to options
        const parsedOptions = await this.parseOptions(msg_body);

        const outputBuffer = await this.bufferMediaToWebp(
            Buffer.from(file),
            parsedOptions
        );

        return outputBuffer;
    }

    async parseOptions(text: string) {
        //Getting all options matches
        const options = [...text.toLowerCase().matchAll(regexOption)];

        //Getting options parsed
        let parsedOptions: ConverterOptions = options.reduce((acc, curr) => {
            (acc as any)[curr[1]] = curr[2];
            return acc;
        }, {});

        return parsedOptions;
    }

    filtersVideoOptions(options: ConverterOptions) {
        const videoFilters: string[] = [];

        Object.entries(options).forEach(([key, value]) => {
            //If the option is not valid, ignore it
            optionsVideoQueries[key] &&
                videoFilters.push(optionsVideoQueries[key](value));
        });

        return videoFilters;
    }

    filterOutputOptions(options: ConverterOptions) {
        const outputOptions: string[] = [];

        Object.entries(options).forEach(([key, value]) => {
            //If the option is not valid, ignore it
            optionsOutputQueries[key] &&
                outputOptions.push(optionsOutputQueries[key](value));
        });

        return outputOptions;
    }

    getTempPath(file: Buffer | string, ext = "webp") {
        const filename = md5(file.toString());
        const path = join(__dirname, "tmp", filename + "." + ext);

        mkdirSync(parse(path).dir, { recursive: true });

        return path;
    }

    async bufferMediaToWebp(buffer: Buffer, options: ConverterOptions = {}) {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        //Get video filters
        const videoFilters = this.filtersVideoOptions(options);
        if (cropQuery) videoFilters.push(cropQuery);

        //Get output options
        const outputOptions = this.filterOutputOptions(options);

        //Create a md5 filename with ffmpeg
        const path = this.getTempPath(buffer);

        // Create a webp file in output stream
        await this.convertFile(stream, path, videoFilters, outputOptions);

        //Convert the file to buffer and delete it
        const outputBuffer = readFileSync(path);
        rmSync(path);

        return outputBuffer;
    }

    async convertFile(
        stream: Readable,
        path: string,
        videoFilters: string[] = [],
        userOutputOptions: string[] = []
    ) {
        return new Promise((resolve, reject) => {
            const command = ffmpeg(stream)
                .withVideoCodec("libwebp")
                .withOptions([...outputOptions, ...userOutputOptions])
                .videoBitrate("16k")
                .videoFilters(videoFilters.join(","))
                .setSize("512x512")
                .toFormat("webp");

            this.manageConvertEvents(command, resolve, reject).saveToFile(path);
        });
    }

    manageConvertEvents(
        command: FfmpegCommand,
        res: (value: unknown) => void,
        rej: (reason: any) => void
    ) {
        command.on("start", (commandLine) => console.log(commandLine));
        command.on("progress", (progress) => console.log(progress));
        command.on("end", () => res(""));
        command.on("error", (err: Error) => rej(err));

        return command;
    }
}
