import express, { Router } from "express";
import cors from "cors";

export const createTestApp = (router: Router) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", router);
  return app;
};
