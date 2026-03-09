import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ServicesSection() {
  return (
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
                width="400"
                height="250"
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
                width="400"
                height="250"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
