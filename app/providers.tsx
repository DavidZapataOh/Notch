"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "demo_key"}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Notch",
          logo: process.env.NEXT_PUBLIC_ICON_URL || "https://placehold.co/100x100/000000/FFFFFF/png?text=N",
        },
      }}
    >
      {props.children}
    </MiniKitProvider>
  );
}
