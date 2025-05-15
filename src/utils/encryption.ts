// import crypto from 'crypto';

// export const deriveKey = (password: string, salt: string): Buffer => {
//     return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
// };

// export const encryptData = (plaintext: string, key: Buffer): {
//     encryptedData: string;
//     iv: string;
//     authTag: string;
// } => {
//     const iv = crypto.randomBytes(12);
//     const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

//     let encrypted = cipher.update(plaintext, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     const authTag = cipher.getAuthTag();

//     return {
//         encryptedData: encrypted,
//         iv: iv.toString('hex'),
//         authTag: authTag.toString('hex'),
//     };
// };

// export const decryptData = (
//     encryptedData: string,
//     key: Buffer,
//     ivHex: string,
//     authTagHex: string
// ): string => {
//     const iv = Buffer.from(ivHex, 'hex');
//     const authTag = Buffer.from(authTagHex, 'hex');

//     const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
//     decipher.setAuthTag(authTag);

//     let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');
//     return decrypted;
// };
// export const generateSalt = (): string => {
//     return crypto.randomBytes(16).toString('hex');
// };





import crypto from 'crypto';

export const generateSalt = (): string => {
    return crypto.randomBytes(16).toString('hex');
};

export const deriveKey = (secret: string, salt: string): Buffer => {
    return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
};

export const encryptData = (
    plaintext: string,
    key: Buffer
): { encryptedData: string; iv: string; authTag: string } => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    };
};

export const decryptData = (
    encryptedData: string,
    key: Buffer,
    ivHex: string,
    authTagHex: string
): string => {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
