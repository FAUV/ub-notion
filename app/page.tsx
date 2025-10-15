"use client";

import UltimateBrainControlCenter from "../src/UltimateBrainControlCenter.jsx";

import dynamic from "next/dynamic";

const UB = dynamic(() => import("../src/UltimateBrainControlCenter").then(m => m.default), { ssr: false });

export default function Page() {
  return <UB />;
}
