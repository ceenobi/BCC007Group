import { Button } from "./ui/button";
import { useTheme } from "~/context/themeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-sm cursor-pointer"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
