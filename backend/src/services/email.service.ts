import nodemailer from 'nodemailer';

interface EmailFileInfo {
    clientEmail: string,
    fileName: string
    pdfData: any,
}

export class EmailService {

    public static async sendEmail(emailInfo: EmailFileInfo): Promise<void> {
        const transponter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PSSWD
            }
        });

        const info = await transponter.sendMail({
            from: `Email generated automaticcly <${process.env.EMAIL_USER}>`,
            to: emailInfo.clientEmail,
            subject: "Report data usages",
            text: "This is the report asked to be send",
            attachments: [{
                filename: emailInfo.fileName,
                content: emailInfo.pdfData,
                contentType: 'application/pdf',
                encoding: 'base64'
            }]
        });

        console.log("Email send:", info.messageId);
    }
}
