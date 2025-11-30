import express from "express";
import cors from "cors";
import routes from "@/routes";

export const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", routes);
  return app;
};
