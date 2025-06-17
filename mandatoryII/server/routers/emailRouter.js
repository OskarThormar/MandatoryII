import { Router } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

router.post('/send-test-email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ error: 'Modtager, emne og indhold.' });
    }

 
    const mailOptions = {
        from: process.env.EMAIL_USER,               
        to: 'scwachwalderkirch@hotmail.com',        
        subject: subject,                           
        text: text,                                 
        html: 'første login udført'                                  
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Test-e-mail sendt succesfuldt!' });
    } catch (error) {
        console.error("Fejl ved afsendelse af e-mail:", error);
        res.status(500).json({ error: 'Kunne ikke sende e-mail.' });
    }
});

export default router;
