
import nodemailer from 'nodemailer';
interface MailOptions {
    to: string;
    subject: string;
    text: string;
}

export const sendVerificationCode = async (email: string, verificationCode: string) => {

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // E-posta hizmet sağlayıcınızı seçin
            auth: {
                user: process.env.EMAIL_ADRESS, // E-posta adresiniz
                pass: process.env.PASSWORD, // E-posta hesap şifreniz
            },
        });
        const mailOptions: MailOptions = {
            to: email,
            subject: 'Rozetle Doğrulama Kodu',
            text: `Mail Adresi için Doğrulama kodunuz: ${verificationCode}\n\nUygulamada açılan panele kodu girerek devam edebilirsiniz`, // Doğrulama kodu
        };

        try {

            await transporter.sendMail(mailOptions);
            console.log("Mail send success")
            return true;
        } catch (error) {
            console.log("could not send mail")
        }

    } catch (error) {
        console.log("Create Transport is failed")
        return false
    }
}