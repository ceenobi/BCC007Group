import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { Progress } from "./ui/progress";

export function ProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (navigation.state === "loading") {
      setIsVisible(true);
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 5;
        });
      }, 300);
    } else {
      if (isVisible) {
        setProgress(100);
        const timeout = setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [navigation.state, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-100 pointer-events-none">
      <Progress
        value={progress}
        className="h-[4px] rounded-none bg-transparent"
        indicatorClassName="bg-velvet transition-all duration-300 ease-out shadow-[0_0_10px_rgba(110,89,255,0.5)]"
      />
    </div>
  );
}
