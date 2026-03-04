import { useNavigate, redirect } from "react-router";
import type { Route } from "./+types/email-verified";
import ActionButton from "~/components/actionButton";
import {
  authenticatedMiddleware,
  type RouterContext,
} from "~/middleware/auth.middleware";
import Logo from "~/components/logo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Email Verified - BCC007Pay" },
    { name: "description", content: "Email Verified - BCC007Pay" },
  ];
}

export const middleware = [authenticatedMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context as unknown as Required<Pick<RouterContext, "user">>;

  if (user && !user?.emailVerified) {
    return redirect("/account/verify-email");
  }
  return null;
}

export default function EmailVerified() {
  const navigate = useNavigate();

  return (
    <>
    <div className="py-6 px-4 fixed top-0 left-0 right-0 z-10">
      <Logo classname="text-2xl"/>
    </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="space-y-2 text-center w-full max-w-[400px] mx-auto px-4">
          <img
            src="/success.png"
            alt="smiley face by storyset"
            className="h-[250px] mx-auto"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Congratulations!
          </h1>
          <p className="text-muted-foreground">
            Your email has been verified successfully.
          </p>
          <ActionButton
            text="Continue"
            type="button"
            classname="w-[125px] font-medium uppercase bg-lightBlue h-10 hover:bg-coolBlue dark:bg-velvet dark:text-white"
            onClick={() => navigate("/dashboard")}
          />
        </div>
      </div>
    </>
  );
}
