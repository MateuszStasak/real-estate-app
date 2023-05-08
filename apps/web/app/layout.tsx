"use client";

import { ReactNode } from "react";
import { Providers } from "./providers";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { extractCritical } from "@emotion/server";

import "../globals.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <style
        // data-emotion-css={(this.props as any).ids.join(" ")}
        // dangerouslySetInnerHTML={{ __html: (this.props as any).css }}
        />
      </Head>
      <body className="flex flex-col items-center h-full">
        <Providers>
          <nav className="sticky top-0 w-full bg-white text-gray-700 shadow-md">
            <Navbar />
          </nav>
          <main>{children}</main>
          <footer className="fixed bottom-0 left-0 w-full pr-6 md:pl-14 md:pr-14 mx-auto">
            <Footer />
          </footer>
        </Providers>
      </body>
    </html>
  );
}

RootLayout.getInitialProps = async (ctx: any) => {
  const initialProps = await RootLayout.getInitialProps(ctx);
  const critical = extractCritical(initialProps.html);
  initialProps.html = critical.html;
  initialProps.styles = (
    <>
      {initialProps.styles}
      <style
        data-emotion-css={critical.ids.join(" ")}
        dangerouslySetInnerHTML={{ __html: critical.css }}
      />
    </>
  );

  return initialProps;
};
