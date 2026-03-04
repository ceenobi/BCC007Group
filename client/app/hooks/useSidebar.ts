import { useEffect, useState } from "react";
import { safeGetItem, safeSetItem } from "~/lib/storage";

export default function useSidebar() {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = safeGetItem("sidebarOpenBcc007Pay");
    if (savedState !== null) {
      setIsOpenSidebar(savedState === "true");
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      safeSetItem("sidebarOpenBcc007Pay", String(isOpenSidebar));
    }
  }, [isOpenSidebar, isMounted]);

  return {
    isOpenSidebar,
    setIsOpenSidebar,
  };
}
