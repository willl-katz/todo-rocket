"use server"
import { ConnectSmtp } from "@/lib/smtp";

type SendReportProps = {
    message: string;
    userEmail: string;
    userName: string;
}

export async function sendReport({message, userEmail, userName}:SendReportProps) {
    let transporter = await ConnectSmtp();
    transporter.sendMail({
        from: 'devwillkatz@gmail.com', // sender address
        to: 'devwillkatz@gmail.com', // list of receivers
        subject: `Requerimento ao Suporte do Todo | ${userEmail}`, // Subject line
        text: `
            -- Usuário --
            Username: ${userName}
            Email: ${userEmail}
            Mensagem: ${message}
        `, // plain text body
    }, (error, info) => {
        if(error) {
            console.log(error);
        }
    })
}