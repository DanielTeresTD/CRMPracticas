import { DataSource } from "typeorm";
import path from "path";

export const DB = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT!, 10),
    entities: [path.join(__dirname, "../entities/*")],
    synchronize: true,
});

export const initOrm = async () => {
    try {
        await DB.initialize();
        console.log("[orm]: ORM initialized");
    } catch (error) {
        console.log("[orm]: ORM initialization failed");
        console.log(error);
        process.exit(1);
    }
}