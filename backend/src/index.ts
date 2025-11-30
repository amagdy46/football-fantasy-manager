import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "@/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Football Fantasy Manager API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
