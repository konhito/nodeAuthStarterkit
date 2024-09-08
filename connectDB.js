import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGOOSE_URI);
    console.log(`MongoDb Connected: ${con.connection.host}`);
  } catch (error) {
    console.log("MongoDb failed to connect", error.message);
    process.exit(1); //failed,0,
  }
};
