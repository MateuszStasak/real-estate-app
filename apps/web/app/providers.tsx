"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { GlobalStyles } from "twin.macro";
import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalStyles />
      <CacheProvider>
        <ChakraProvider>{children}</ChakraProvider>
      </CacheProvider>
    </>
  );
}
