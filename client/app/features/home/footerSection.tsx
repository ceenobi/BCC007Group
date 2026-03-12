import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { Link } from "react-router";

export default function FooterSection() {
  return (
    <footer className="relative border-t z-10 bg-slate-50 dark:bg-coolBlue/20 shadow-lg">
      <div className="container mx-auto p-4 lg:px-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap flex-col md:flex-row justify-between w-full sm:w-fit gap-4 items-center">
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
          <p className="w-full md:w-auto text-center md:text-left dark:text-white text-gray-800 text-sm">
            &copy; {new Date().getFullYear()} BCC007. Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
