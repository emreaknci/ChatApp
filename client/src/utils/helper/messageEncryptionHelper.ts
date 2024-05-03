import * as crypto from 'crypto-js';

const KEY = import.meta.env.VITE_KEY;
const IV = import.meta.env.VITE_IV;

export const encryptMessage = (message: string): string => {
    const encrypted = crypto.AES.encrypt(message, crypto.enc.Utf8.parse(KEY), { iv: crypto.enc.Utf8.parse(IV) });
    return encrypted.toString();
};

export const decryptMessage = (encryptedMessage: string): string => {
    const decrypted = crypto.AES.decrypt(encryptedMessage, crypto.enc.Utf8.parse(KEY), { iv: crypto.enc.Utf8.parse(IV) });
    return decrypted.toString(crypto.enc.Utf8);
};
