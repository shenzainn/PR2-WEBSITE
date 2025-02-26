import dotenv from 'dotenv';

dotenv.config();

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/PR2_Website";

const connectDB = async () => {
    try {
        await mongoose.connect(dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1); // Stop the server if DB connection fails
    }
};

export default connectDB;