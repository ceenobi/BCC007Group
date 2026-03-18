import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function AboutSection() {
  return (
    <div
      className="bg-white dark:bg-coolBlue/20 z-20 relative py-20"
      id="about"
    >
      <div className="container mx-auto p-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.img
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          src="/bcc.jpg"
          alt="bcc007-group image"
          className="rounded-xl shadow-xl w-full h-full"
          loading="lazy"
          width="600"
          height="400"
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 md:mt-0 space-y-6 text-center lg:text-start"
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
  );
}
