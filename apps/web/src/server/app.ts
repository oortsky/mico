import { Hono } from "hono";

import authRoutes from "./routes/auth";

const app = new Hono();

app.route("/api", authRoutes);

export default app;