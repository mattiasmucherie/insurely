import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import sessions from "./routes/sessions";

const app = new Hono();

app.use("/*", cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/sessions", sessions);

const port = 3001;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
