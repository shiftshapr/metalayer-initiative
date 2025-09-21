import express from "express";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
export const prisma = new PrismaClient();

app.get("/health", (_req, res) => res.json({ ok: true }));
// TODO: implement routes per openapi.yaml

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", ts: Date.now() }));
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`API on :${port}`));
