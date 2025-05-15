import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    encryptedEmail: { type: String, required: true },
    emailHmac: { type: String, required: true, unique: true },
    emailSalt: { type: String, required: true },
    emailIV: { type: String, required: true },
    emailAuthTag: { type: String, required: true },
    masterPassword: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);