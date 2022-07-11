import timeout from "connect-timeout";
import express, { json } from "express";

import gradebookRoutes from "./routes/gradebook.routes.js";

const app = express();

app.use(timeout("30s"));
app.use(json());
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.use((error, req, res, next) => {
  if (error instanceof Error) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

app.use("", gradebookRoutes);

export default app;
