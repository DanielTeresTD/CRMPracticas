import mysql from "mysql2/promise";


export const connection = await mysql.createPool({
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT!, 10),
});
console.log("Conexión realizada con éxito a la base de datos");

