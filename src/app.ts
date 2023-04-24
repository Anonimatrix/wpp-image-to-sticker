import { config } from "dotenv";
config();
import { services } from "./config/services";

(async () => {
    const db = services.db;
    await db.init();

    const server = services.server;

    const port = await server.init(Number(process.env.PORT || 3000));
    console.log(`Server running on port ${port}`);
})();
