"use server"
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

export async function ConnectSmtp() {
    return await nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Desativei pela falta do SSL, quando houver ative essa opção.
        tls: {
            rejectUnauthorized: false
        }
    });
}