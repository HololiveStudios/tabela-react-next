// src/components/DeviceDetect.tsx
"use client";

import { useEffect, useState } from "react";
import DesktopView from "@/components/DesktopView";
import MobileView from "@/components/MobileView";

export default function DeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();

    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return isMobile ? <MobileView /> : <DesktopView />;
}
