import { EventEmitter } from "events";

export const serverEvents = new EventEmitter();

// Log events for debugging in development
if (process.env.NODE_ENV === "development") {
  serverEvents.on("ticket:updated", (data) => {
    console.log("SSE Event: ticket:updated", data);
  });
  serverEvents.on("ticket:created", (data) => {
    console.log("SSE Event: ticket:created", data);
  });
  serverEvents.on("member:created", (data) => {
    console.log("SSE Event: member:created", data);
  });
  serverEvents.on("payment:completed", (data) => {
    console.log("SSE Event: payment:completed", data);
  });
}
