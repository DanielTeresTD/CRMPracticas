import mysql from "mysql2/promise";
import.meta.dirname;

export class Database {
    // Considered as optional value and it´s undefined by default
    private connection?: mysql.Connection;

    async connect() {
        if (this.connection) {
            console.log("Ya existe una conexión activa");
            return this.connection;
        }

        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST!,
                user: process.env.DB_USER!,
                password: process.env.DB_PASSWORD!,
                database: process.env.DB_NAME!,
                port: parseInt(process.env.DB_PORT!, 10),
            });
            console.log("Conexión realizada con éxito a la base de datos");
            return this.connection;
        } catch (error) {
            console.error("Error al conectar a la base de datos:", error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.end();
                console.log("Conexión cerrada correctamente");
                this.connection = undefined;
            } catch (error) {
                console.error("Ha ocurrido un error al cerrar la base de datos:", error);
                throw error;
            }
        }
    }

    getConnection() {
        if (!this.connection) {
            throw new Error("No hay conexión activa a la base de datos");
        }
        return this.connection;
    }
}
