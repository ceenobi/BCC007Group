import type { Route } from "./+types/home";
import { Calendar, Coins, Hand, Instagram } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Logo from "~/components/logo";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Link } from "react-router";
import Profile from "~/components/profile";
import SuspenseUi from "~/components/suspenseUi";
import { motion, type Variants } from "framer-motion";
import {
  sessionMiddleware,
  type RouterContext,
} from "~/middleware/auth.middleware";

export const middleware = [sessionMiddleware];

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
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context as unknown as RouterContext;
  return { user };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const heroContentVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
  },
};

const heroImageVariants: Variants = {
  hidden: { opacity: 0, x: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 1, ease: "easeOut", delay: 0.4 },
  },
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  const info = [
    {
      title: "Payments",
      icon: <Coins className="dark:text-blue-500 text-coolBlue size-10" />,
      sub: "Manage payments and transfers, get insights, see trends overtime",
    },
    {
      title: "Events",
      icon: <Calendar className="dark:text-blue-500 text-coolBlue size-10" />,
      sub: "Manage members, records, events and more, all in one place",
    },
    {
      title: "Ease of Use",
      icon: <Hand className="dark:text-blue-500 text-coolBlue size-10" />,
      sub: "Everything centralized in one place",
    },
  ];

  return (
    <Suspense fallback={<SuspenseUi />}>
      <div className="relative min-h-dvh md:min-h-[60dvh] xl:min-h-dvh bg-linear-to-bl from-lightBlue via-lightBlue/50 to-lightBlue text-zinc-900 dark:text-white overflow-hidden">
        <div className="container mx-auto p-4 lg:px-8" id="home">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-5 left-4 right-4 flex justify-center items-center py-3 px-4 bg-white/30 backdrop-blur supports-backdrop-filter:bg-white/70 shadow rounded-full z-50 transition-all duration-300`}
          >
            <div className="flex justify-between items-center w-full container mx-auto px-4">
              <Logo
                classname="text-2xl filter drop-shadow-xl"
                color={scrolled ? "text-coolBlue" : "text-coolBlue"}
              />
              <div className="flex gap-8 lg:gap-12 items-center">
                {links.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "hidden md:block transition-all duration-300 ease-in-out",
                      scrolled
                        ? "text-gray-800 dark:text-coolBlue hover:text-lightBlue hover:font-semibold"
                        : "text-coolBlue hover:text-coolBlue hover:font-semibold",
                    )}
                  >
                    <span>{link.name}</span>
                  </motion.a>
                ))}
                {user ? (
                  <Profile user={user} />
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      asChild
                      className="rounded-sm w-fit bg-white hover:bg-slate-100 text-lightBlue hover:text-white hover:dark:text-coolBlue h-8 font-bold"
                      variant="default"
                    >
                      <Link to="/account/login">Sign In</Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <div
            className="min-h-[500px] items-center justify-center grid grid-cols-1 lg:grid-cols-2 gap-4 mt-30"
            id="home"
          >
            <motion.div
              variants={heroContentVariants}
              initial="hidden"
              animate="visible"
              className="lg:max-w-full mx-auto text-center lg:text-start text-white space-y-6"
            >
              <motion.h1
                variants={itemVariants}
                className="text-6xl md:text-7xl font-bold"
              >
                <span className="tracking-tighter inline-block">DISCOVER</span>{" "}
                <br />
                <span className="tracking-widest inline-block text-white">
                  BCC007
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-md sm:text-xl w-[80%] mx-auto lg:mx-0"
              >
                BCCOO7 Platform is a web application that allows its users to
                manage their payments and transfers.
              </motion.p>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
                <Button
                  asChild
                  className="rounded-sm shadow-lg w-[200px] bg-white text-lightBlue hover:text-white hover:dark:text-coolBlue h-12 font-bold"
                  variant="default"
                >
                  <Link to="/dashboard">Continue to Dashboard</Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              variants={heroImageVariants}
              initial="hidden"
              animate="visible"
              className="text-start overflow-clip relative"
            >
              <motion.img
                src="https://res.cloudinary.com/ceenobi/image/upload/q_auto/v1761658645/BCCOO7DB/iPhone-12-PRO-localhost_jntqwj.webp"
                alt="Phone Mockup"
                className="relative z-10 w-fit h-[600px] mx-auto object-contain md:mr-0"
                loading="eager"
                decoding="async"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.img
                src="https://res.cloudinary.com/ceenobi/image/upload/q_auto/v1761670294/BCCOO7DB/Macbook-Air-localhost_1_tqdw5a.webp"
                alt="dashboard mockup"
                className="hidden md:block absolute top-5 md:top-[-150px] lg:top-0 xl:top-[-50px] 2xl:top-[-130px] right-0 transform translate-y-1/2 object-contain border-4 border-coolBlue/20 rounded-xl w-full max-w-[700px] h-auto"
                loading="eager"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-coolBlue/30 z-10 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="container mx-auto p-4 lg:px-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-20">
            {info.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center lg:text-start lg:flex gap-4 p-4 rounded-lg space-y-4 hover:shadow-lg hover:bg-zinc-50 dark:hover:bg-white/5 transition-shadow duration-300"
              >
                <div className="flex justify-center shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full text-lightBlue size-16 hover:bg-white flex items-center justify-center p-2"
                  >
                    {item.icon}
                  </Button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{item.title}</h1>
                  <p className="text-sm text-muted-foreground">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div
        className="bg-white dark:bg-coolBlue/20 z-20 relative py-20"
        id="about"
      >
        <div className="container mx-auto p-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src="/bcc.jpg"
            alt="bcc007-group image"
            className="rounded-xl shadow-2xl"
          />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 md:mt-0 space-y-6 text-center md:text-start"
          >
            <h1 className="text-zinc-800 dark:text-white text-5xl">
              Who we are?
            </h1>
            <p className="text-foreground">
              We are a community dedicated to preserving and promoting the core
              values and culture of our alma mater - Brilliant Child College.
              Through our platform, we connect with our fellow alumni, share
              experiences, and celebrate the achievements of our community.
            </p>
            <p className="text-foreground">
              Thanks to regular donations and monthly contributions, we are able
              to strengthen our community, host programs that bring people
              together, and create meaningful opportunities that secure a
              brighter future for our children.
            </p>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                asChild
                className="rounded-sm shadow-lg w-[200px] bg-lightBlue hover:bg-coolBlue text-white h-12 font-bold transition-all duration-300"
                variant="default"
              >
                <Link to="/dashboard">Continue</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="relative bg-white dark:bg-coolBlue/20">
        <div
          className={cn(
            "absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-size-[35px_34px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
            "dark:bg-coolBlue/70 bg-zinc-200",
          )}
        ></div>

        <div
          className="container mx-auto mb-20 py-10 px-4 relative z-10"
          id="services"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h1 className="text-zinc-800 dark:text-white text-5xl">Services</h1>
            <p className="text-muted-foreground dark:text-white font-medium">
              Discover the key pillars of our platform
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 px-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="space-y-4 group"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src="https://res.cloudinary.com/ceenobi/image/upload/q_auto:best/v1772634553/download_kngsdx.webp"
                  alt="naira payment illustration"
                  loading="lazy"
                  className="rounded-xl h-[250px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="md:text-sm text-muted-foreground dark:text-white">
                Manage your payments either donations or our membership fees
                with ease. Never forget to pay again.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgb(67, 56, 202)",
                }}
                className="flex flex-col md:items-center bg-indigo-600 p-4 rounded-xl space-y-4 h-[230px] transition-colors duration-300"
              >
                <h1 className="text-2xl font-bold text-white">
                  Never miss out on an event
                </h1>
                <p className="md:text-sm text-white">
                  Get notified about all events and activities. From birthdays,
                  anniversaries, to just regular hangouts, BCC007 will keep you
                  updated.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-black dark:bg-white p-4 rounded-xl space-y-4 h-[200px]"
              >
                <h1 className="text-2xl font-bold text-white dark:text-black">
                  Community
                </h1>
                <p className="md:text-sm text-white dark:text-black">
                  Connect with your fellow alumni. We're building something
                  great. Your commitment and donations will make a difference.
                </p>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 group">
              <h1 className="text-2xl font-bold">Ease of Use</h1>
              <p className="text-sm text-muted-foreground dark:text-white">
                Everything centralized in one place.
              </p>
              <div className="overflow-hidden rounded-xl">
                <img
                  src="https://res.cloudinary.com/ceenobi/image/upload/v1764191114/BCC007DB/download_xvo2qn.jpg"
                  alt="ease of use"
                  className="rounded-xl h-[250px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto mb-20 py-10 px-4"
        id="contact"
      >
        <div className="text-center space-y-4">
          <h1 className="text-zinc-800 dark:text-white text-5xl">Contact</h1>
          <p className="mt-8 text-muted-foreground font-medium w-full md:w-[70%] lg:w-[50%] mx-auto">
            We would love to hear from you. Feel free to ask any question.
            Please note BCCOO7 is a member only platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.a
              whileHover={{ scale: 1.05, color: "#003e7d" }}
              href="https://wa.me/+2347000000000?text=Hello, This is from BCC007Team."
              target="_blank"
              className="text-muted-foreground font-medium transition-colors"
            >
              Call/Whatspp: +234 700 000 0000
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05, color: "#003e7d" }}
              href="mailto:bcc007set@gmail.com"
              className="text-muted-foreground font-medium transition-colors"
            >
              Email:bcc007set@gmail.com
            </motion.a>
          </div>
        </div>
      </motion.div>

      <footer className="relative border-t z-10 bg-slate-50 dark:bg-coolBlue/20 shadow-lg">
        <div className="container mx-auto p-4 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap justify-between w-full sm:w-fit gap-4 items-center">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 10 }}
                href="https://www.instagram.com/bcc007set"
                className="text-xl font-bold text-lightBlue"
                target="_blank"
                rel="noopener noreferrer"
                title="Visit our Instagram page"
              >
                <Instagram size={28} />
              </motion.a>
              <Link
                to="/privacy-policy"
                className="text-sm hover:text-coolBlue transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm hover:text-coolBlue transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="dark:text-white text-gray-800 text-sm">
              &copy; {new Date().getFullYear()} BCC007. Inc.
            </p>
          </div>
        </div>
      </footer>
    </Suspense>
  );
}
