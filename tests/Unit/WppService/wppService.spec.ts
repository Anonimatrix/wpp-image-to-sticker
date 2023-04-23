import { config } from "dotenv";
config();
import { services } from "../../../src/config/services";
import fs from "fs";
import { Readable } from "stream";

const wppService = services.wpp;

describe("WhatsApp Service", () => {
    it("check uploadSticker with stream", async () => {
        const stream = fs.createReadStream(__dirname + "/sticker.webp");
        const id = await wppService.uploadSticker(stream);

        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
    });

    it("check uploadSticker with buffer", async () => {
        const buffer = fs.readFileSync(__dirname + "/sticker.webp");
        const id = await wppService.uploadSticker(buffer);

        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
    });
});
