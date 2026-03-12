import { motion, type Variants } from "framer-motion";
import { Coins, Calendar, Hand } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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

export default function InfoSection() {
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
  );
}
