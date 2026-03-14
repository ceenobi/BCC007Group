import { useEffect } from "react";
import type { Route } from "./+types/logout";
import { useNavigate } from "react-router";
import { logout } from "~/lib/actions/auth.action";
import { getQueryClient } from "~/lib/queryClient";
import { toast } from "sonner";

export const action = async ({ request }: Route.ActionArgs) => {
  const res = await logout({
    cookie: request.headers.get("Cookie") || "",
  });

  // ts-rest client returns an object with status, body, and headers
  if (res.status !== 200) {
    return res;
  }

  const headers = new Headers();

  // Forward Set-Cookie headers from the backend to the browser
  if (res.headers) {
    // If headers is a Headers object
    if (typeof res.headers.entries === "function") {
      for (const [key, value] of res.headers.entries()) {
        if (key.toLowerCase() === "set-cookie") {
          headers.append("Set-Cookie", value);
        }
      }
    } else {
      // If headers is a plain object Record<string, string>
      Object.entries(res.headers as Record<string, string>).forEach(
        ([key, value]) => {
          if (key.toLowerCase() === "set-cookie" && value) {
            headers.append("Set-Cookie", value);
          }
        },
      );
    }
  }

  headers.set("Location", "/account/login");
  return new Response(null, { status: 302, headers });
};

export default function Logout({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const queryClient = getQueryClient();
  useEffect(() => {
    if (actionData?.status === 200) {
      toast.success(`Successfully logged out 👋🏼`, {
        id: "logout",
      });
      queryClient.clear();
      navigate("/account/login");
    }
  }, [actionData, navigate]);
  return null;
}
