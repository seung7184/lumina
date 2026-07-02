"use client";

import dynamic from "next/dynamic";

const FunctionalWorkspace = dynamic(
  () => import("@/components/workspace/FunctionalWorkspace").then((m) => ({ default: m.FunctionalWorkspace })),
  { ssr: false },
);

export default function WorkspacePage() {
  return <FunctionalWorkspace />;
}
