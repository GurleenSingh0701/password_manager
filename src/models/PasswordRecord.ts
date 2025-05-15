// src/models/PasswordRecord.ts
import mongoose from 'mongoose';

const PasswordRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User collection
        required: true,
    },
    website: String,
    username: String,
    encryptedPassword: String,
    iv: String,
    authTag: String,
    salt: String,
}, { timestamps: true });

const PasswordRecord = mongoose.models.PasswordRecord || mongoose.model('PasswordRecord', PasswordRecordSchema);
export default PasswordRecord;
