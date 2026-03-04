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
  if (!res.ok) return res;
  const headers = new Headers();
  for (const [key, value] of res.headers.entries()) {
    if (key.toLowerCase() === "set-cookie") {
      headers.append("Set-Cookie", value);
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
