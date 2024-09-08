import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./connectDB.js";
import authRoutes from "./routes/authRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  connectDB();
  console.log(`server is runnning ar port ${port}`);
});
