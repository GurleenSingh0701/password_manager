import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    } | undefined;
}

// Avoid creating multiple connections in development
let cached = globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!cached) {
    cached = globalThis.mongooseCache = {
        conn: null,
        promise: null,
    };
}

async function connectDB(): Promise<mongoose.Mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "newDB",
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
