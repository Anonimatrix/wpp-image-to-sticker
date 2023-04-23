import { ConverterManager } from "../../../src/services/whatsapp/Converter/ConverterManager";
import { readFileSync } from "fs";
import { join } from "path";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import fs from "fs";

describe("convertManager", () => {
    it("should convert a file to a webp", async () => {
        const convertManager = new ConverterManager();
        const file = readFileSync(join(__dirname, "catavento.png"));

        const output = await convertManager.bufferJpgToWebp(file);

        expect(output instanceof Buffer).toBeTruthy();
        expect(output.toString("utf-8").length).toBeGreaterThan(0);
    });
});
