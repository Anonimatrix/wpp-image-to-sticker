import { Request, Response } from "express";
import { services } from "../config/services";

process.addListener("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

const webhookVerification = async (req: Request, res: Response) => {
    // Parse params from the webhook verification request
    let mode = String(req.query["hub.mode"] || "");
    let token = String(req.query["hub.verify_token"] || "");
    let challenge = String(req.query["hub.challenge"] || "");

    if (!services.wpp.verificateToken(mode, token)) {
        // Respond with '403 Forbidden' if verify tokens do not match
        return res.sendStatus(403);
    }

    // Respond with the challenge token from the request
    return res.status(200).send(challenge);
};

const webhook = async (req: Request, res: Response) => {
    const { entry, object } = req.body;

    if (!object) {
        return res.sendStatus(404);
    }

    try {
        const status = await services.requestManager.manage(entry);

        return res.sendStatus(status);
    } catch (e) {
        console.log(e instanceof Error ? e.message : "Unknown Error");
        return res.sendStatus(500);
    }
};

export default {
    webhookVerification,
    webhook,
};
