import * as crypto from 'crypto';

export const encryptMessage = (message: string, key: Buffer, iv: Buffer): string => {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedMessage = cipher.update(message, 'utf8', 'hex');
    encryptedMessage += cipher.final('hex');
    return encryptedMessage;
};

export const decryptMessage = (encryptedMessage: string, key: Buffer, iv: Buffer): string => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
    decryptedMessage += decipher.final('utf8');
    return decryptedMessage;
};