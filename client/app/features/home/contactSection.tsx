import { motion } from "framer-motion";

export default function ContactSection() {
  return (
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
  );
}
