import nodemailer from 'nodemailer';
import path from 'path';

export class EmailService {

    public static async sendEmail(pathToPdf: string = ""): Promise<void> {
        const transponter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: "nels67@ethereal.email",
                pass: "PjWa1w54q6Ksk27juj"
            }
        });

        const info = await transponter.sendMail({
            from: "Correo prueba <nels67@ethereal.email>",
            to: "kafavep645@inilas.com",
            subject: "Prueba correo",
            text: "Esto es el cuerpo del mensaje",
            attachments: [{
                filename: path.basename(pathToPdf),
                path: pathToPdf
            }]
        });

        console.log("Mensaje enviado:", info.messageId);
    }
}
