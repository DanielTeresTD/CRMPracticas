import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

const envPath = path.resolve(import.meta.dirname, "../../.env");

if (!fs.existsSync(envPath)) {
    throw new Error("No se ha encontrado el archivo .env");
}

dotenv.config({ path: envPath });

// Check if all .env variables were loaded correctly.
const requiredEnvVars: Array<string> = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_PORT"
];

const missingVars = requiredEnvVars.filter((varEnvName) => { !process.env[varEnvName] });

if (missingVars.length > 0) {
    console.error('The following environment variables are missing:');
    missingVars.forEach(varName => console.error(`- ${varName}`));
    console.error('Please add required environment variables before continuing...');
    process.exit(1);
}