import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(recipients, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(','),
        subject: 'Phishing Simulation Link',
        text: `Please visit the following link: ${link}`
    };

    return transporter.sendMail(mailOptions);
}

let twilioClient = null;

function getTwilioClient() {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
        throw new Error('Twilio credentials are not configured in .env');
    }
    if (!twilioClient) {
        twilioClient = twilio(sid, token);
    }
    return twilioClient;
}

async function sendSMS(recipients, link) {
    const client = getTwilioClient();
    const results = [];

    for (const number of recipients) {
        try {
            const msg = await client.messages.create({
                body: `Please visit the following link: ${link}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: number
            });

            results.push(msg);

        } catch (err) {
            console.error(`Failed to send SMS to ${number}:`, err);
        }
    }

    return results;
}

export { sendEmail, sendSMS };