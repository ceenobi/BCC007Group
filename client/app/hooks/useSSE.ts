import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { getQueryClient } from "~/lib/queryClient";
import { notificationStore } from "~/context/notificationStore";

export function useSSE() {
  const revalidator = useRevalidator();
  const queryClient = getQueryClient();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:4600";
    const eventSource = new EventSource(`${baseUrl}/api/sse/stream`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log(
        "SSE: Connection established to",
        `${baseUrl}/api/sse/stream`,
      );
    };

    eventSource.addEventListener("ping", (event) => {
      console.log("SSE: Ping received", event.data);
    });

    eventSource.addEventListener("ticket:updated", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: ticket:updated inherited", data);
      notificationStore.addNotification({
        type: "ticket",
        title: "Ticket Updated",
        description: `Ticket #${data.ticketId} has been updated.`,
        link: `/help-desk?query=${data.ticketId}`,
      });
      // Invalidate tanstack query
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      // Revalidate react-router loaders
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("ticket:created", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: ticket:created inherited", data);
      notificationStore.addNotification({
        type: "ticket",
        title: "New Ticket Created",
        description: `A new ticket #${data.ticketId} was created.`,
        link: `/help-desk?query=${data.ticketId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("event:updated", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: event:updated inherited", data);
      notificationStore.addNotification({
        type: "event",
        title: "Event Updated",
        description: `Event "${data.title}" has been updated.`,
        link: `/events?query=${data.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("event:created", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: event:created inherited", data);
      notificationStore.addNotification({
        type: "event",
        title: "New Event Created",
        description: `A new event "${data.title}" has been created.`,
        link: `/events?query=${data.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("member:created", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: member:created inherited", data);
      notificationStore.addNotification({
        type: "member",
        title: "New Member Added",
        description: `A new member "${data.name}" has been added.`,
        link: `/members?query=${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("member:updated", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: member:updated inherited", data);
      notificationStore.addNotification({
        type: "member",
        title: "Member Updated",
        description: `Member "${data.name}" has been updated.`,
        link: `/members?query=${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.addEventListener("payment:completed", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE: payment:completed inherited", data);
      notificationStore.addNotification({
        type: "payment",
        title: "Payment Completed",
        description: `Payment "${data.reference}" has been completed.`,
        link: `/payments?query=${data.reference}`,
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    });

    eventSource.onerror = (error) => {
      console.error("SSE: Connection error", error);
      eventSource.close();
    };

    return () => {
      console.log("SSE: Closing connection");
      eventSource.close();
    };
  }, [revalidator, queryClient]); // Re-connect if these change (though they shouldn't)
}
