import type { Route } from "./+types/home";
import { Suspense, useEffect, useState, lazy } from "react";
import SuspenseUi from "~/components/suspenseUi";
import {
  sessionMiddleware,
  type RouterContext,
} from "~/middleware/auth.middleware";

export const middleware = [sessionMiddleware];

const HeroSection = lazy(() => import("~/features/home/heroSection"));
const InfoSection = lazy(() => import("~/features/home/infoSection"));
const AboutSection = lazy(() => import("~/features/home/aboutSection"));
const ServicesSection = lazy(() => import("~/features/home/servicesSection"));
const ContactSection = lazy(() => import("~/features/home/contactSection"));
const FooterSection = lazy(() => import("~/features/home/footerSection"));

export function meta({}: Route.MetaArgs) {
  return [
    {
      title: "Welcome to BCC007Pay - Manage your payments and transfers",
    },
    {
      name: "description",
      content:
        "BCC007Pay, a web application that allows its members to manage their payments and transfers.",
    },
    {
      tagName: "link",
      rel: "preload",
      href: "https://res.cloudinary.com/ceenobi/image/upload/q_auto/v1761658645/BCCOO7DB/iPhone-12-PRO-localhost_jntqwj.webp",
      as: "image",
    },
    {
      tagName: "link",
      rel: "preload",
      href: "https://res.cloudinary.com/ceenobi/image/upload/q_auto/v1761670294/BCCOO7DB/Macbook-Air-localhost_1_tqdw5a.webp",
      as: "image",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context as unknown as RouterContext;
  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [scrolled, setScrolled] = useState(false);

  const throttle = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeoutId) return;
      func(...args);
      timeoutId = setTimeout(() => (timeoutId = null), delay);
    };
  };

  const handleScroll = () => {
    setScrolled(window.scrollY > 100);
  };

  const throttledScroll = throttle(handleScroll, 100);

  useEffect(() => {
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [throttledScroll]);

  return (
    <>
      <HeroSection user={user} scrolled={scrolled} />
      <Suspense fallback={<SuspenseUi />}>
        <InfoSection />

        <AboutSection />

        <ServicesSection />

        <ContactSection />
      </Suspense>
      <FooterSection />
    </>
  );
}
