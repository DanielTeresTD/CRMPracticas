import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

export const PORT: number = 3000;

const envPath = path.resolve(__dirname, "../../.env");

if (!fs.existsSync(envPath)) {
    throw new Error(".env file was not found");
}

dotenv.config({ path: envPath });

// Check if all .env variables were loaded correctly.
const requiredEnvVars: Array<string> = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "DB_PORT",
    "EMAIL_USER",
    "EMAIL_PSSWD",
    "JWT_PSSWD",
    "API_BUS_LINES_STOPS",
    "RESOURCE_ID_BUS_LINES_STOPS"
];

const missingVars = requiredEnvVars.filter(varEnvName => !process.env[varEnvName]);

if (missingVars.length > 0) {
    console.error("The following environment variables are missing:");
    missingVars.forEach(varName => console.error(`- ${varName}`));
    process.exit(1);
}