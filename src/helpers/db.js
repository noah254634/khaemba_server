import mongoose from "mongoose";

export const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("✅ Database connected")
    } catch (error) {
        console.log("❌", error);
        process.exit(1)
    }
}

export const dbDisconnect = async () => {
    await mongoose.disconnect();
    console.log("🔌 Database disconnected");
}