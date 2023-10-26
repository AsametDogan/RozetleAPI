import CryptoJS from 'crypto-js';

const secretKey = process.env.TOKEN_SECRET;

// Veriyi şifrele
export const encryptData = (data: string) => {
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    return ciphertext;
}

// Şifreli veriyi çöz
export const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}
