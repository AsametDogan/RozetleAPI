export const generateVerificationCode: () => string = () => {
    const verificationCode = Math.floor(10000 + Math.random() * 90000);
    return verificationCode.toString();
}