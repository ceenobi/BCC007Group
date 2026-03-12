import { motion, useReducedMotion } from "framer-motion";
import Logo from "~/components/logo";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Link } from "react-router";
import Profile from "~/components/profile";

const heroContentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const heroImageVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, delay: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

interface HeroSectionProps {
  user: any;
  scrolled: boolean;
}

export default function HeroSection({ user, scrolled }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const links = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="relative min-h-dvh md:min-h-full xl:min-h-dvh bg-linear-to-bl from-lightBlue via-lightBlue/50 to-lightBlue text-zinc-900 dark:text-white overflow-hidden flex flex-col justify-center items-center">
      <div className="container mx-auto px-4 py-4 lg:px-8" id="home">
        <motion.div
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`fixed top-5 left-4 right-4 flex justify-center items-center p-4 bg-white/30 backdrop-blur supports-backdrop-filter:bg-white/70 shadow rounded-full z-50 transition-all duration-300`}
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
          className="min-h-[500px] xl:min-h-full items-center justify-center grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 py-30"
          id="home"
        >
          <motion.div
            variants={heroContentVariants}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="lg:max-w-full mx-auto text-center lg:text-start text-white space-y-6"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold"
            >
              <span className="tracking-tighter inline-block">DISCOVER</span>{" "}
              <br />
              <span className="tracking-widest inline-block text-white">
                BCC007
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-md sm:text-xl w-[80%] lg:w-[80%] mx-auto lg:mx-0"
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
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="text-start overflow-clip relative"
          >
            <motion.img
              src="https://res.cloudinary.com/ceenobi/image/upload/q_auto/v1761658645/BCCOO7DB/iPhone-12-PRO-localhost_jntqwj.webp"
              alt="Phone Mockup"
              className="relative z-10 w-full max-w-[320px] sm:max-w-[400px] h-auto md:h-[600px] md:w-fit mx-auto object-contain md:mr-0"
              loading="eager"
              decoding="async"
              width="400"
              height="600"
              animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
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
              width="700"
              height="400"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
