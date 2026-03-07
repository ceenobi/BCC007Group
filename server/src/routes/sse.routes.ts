import express from "express";
import { serverEvents } from "@/lib/events.js";
import logger from "@/config/logger.js";

const sseRouter = express.Router();

sseRouter.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  logger.info("New SSE connection established");

  const onTicketUpdate = (data: any) => {
    res.write(`event: ticket:updated\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  const onTicketCreate = (data: any) => {
    res.write(`event: ticket:created\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  const onEventUpdate = (data: any) => {
    res.write(`event: event:updated\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  const onEventCreate = (data: any) => {
    res.write(`event: event:created\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  const onMemberCreate = (data: any) => {
    res.write(`event: member:created\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  const onPaymentComplete = (data: any) => {
    res.write(`event: payment:completed\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  serverEvents.on("ticket:updated", onTicketUpdate);
  serverEvents.on("ticket:created", onTicketCreate);
  serverEvents.on("event:updated", onEventUpdate);
  serverEvents.on("event:created", onEventCreate);
  serverEvents.on("member:created", onMemberCreate);
  serverEvents.on("payment:completed", onPaymentComplete);

  // Keep connection alive with a heartbeat ogni 30 seconds
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
    if ((res as any).flush) {
      (res as any).flush();
    }
  }, 30000);

  // Send a ping to confirm connection
  res.write("event: ping\ndata: connected\n\n");
  if ((res as any).flush) {
    (res as any).flush();
  }

  req.on("close", () => {
    logger.info("SSE connection closed");
    serverEvents.off("ticket:updated", onTicketUpdate);
    serverEvents.off("ticket:created", onTicketCreate);
    serverEvents.off("event:updated", onEventUpdate);
    serverEvents.off("event:created", onEventCreate);
    serverEvents.off("member:created", onMemberCreate);
    serverEvents.off("payment:completed", onPaymentComplete);
    clearInterval(heartbeat);
  });
});

export default sseRouter;
