import mysql from "mysql2/promise";

let connection: mysql.Pool;

try {
    // Keeps connection alive and reuse existing connection for better performance.
    connection = mysql.createPool({
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        port: parseInt(process.env.DB_PORT!, 10),
    });
} catch (error) {
    console.log("An error ocurred while initializing connection to database: ");
    console.log(error);
    throw error; // Propagate error through stack
}

export default connection;


console.log("Conexión realizada con éxito a la base de datos");

