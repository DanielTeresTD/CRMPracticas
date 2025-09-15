import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import * as mysql from "mysql";

const envPath = path.resolve(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
    throw new Error("No se ha encontrado el archivo .env");
}

// load .env file and create database connection
dotenv.config({ path: envPath });
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Connect asynchronously into the database
const connectDB = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        connection.connect((error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
};

// Disconnect asynchronously from database
const disconnectDB = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        connection.end((error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
};

// Exported connections and functions for /models logic.
export { connection, connectDB, disconnectDB };

