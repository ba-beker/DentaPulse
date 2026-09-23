"use client";

import { installFrenchZodErrorMap } from "@dentapulse/shared";
import type { ReactNode } from "react";
import { DemoStoreProvider } from "../lib/demo/context";

installFrenchZodErrorMap();

export function AppProviders({ children }: { children: ReactNode }) {
  return <DemoStoreProvider>{children}</DemoStoreProvider>;
}
