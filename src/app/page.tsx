"use client";

import Landing from "@/pages/Landing";
import { useAppStore } from "@/lib/navigationStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  return <Landing />;
}
