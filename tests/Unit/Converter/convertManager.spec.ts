import { ConverterManager } from "../../../src/services/whatsapp/Converter/ConverterManager";
import { readFileSync } from "fs";
import { join } from "path";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import fs from "fs";

jest.setTimeout(1000000);

describe("convertManager", () => {
    it("should convert a image to a webp", async () => {
        const convertManager = new ConverterManager();
        const file = readFileSync(join(__dirname, "image.jpeg"));

        const output = await convertManager.bufferMediaToWebp(file);
        fs.writeFileSync(join(__dirname, "image.webp"), output);

        expect(output instanceof Buffer).toBeTruthy();
        expect(output.toString("utf-8").length).toBeGreaterThan(0);
    });

    it("should convert a video to a webp", async () => {
        const convertManager = new ConverterManager();
        const file = readFileSync(join(__dirname, "video.mp4"));

        const output = await convertManager.bufferMediaToWebp(file);

        fs.writeFileSync(join(__dirname, "video.webp"), output);

        expect(output instanceof Buffer).toBeTruthy();
        expect(output.toString("utf-8").length).toBeGreaterThan(0);
    });
});
