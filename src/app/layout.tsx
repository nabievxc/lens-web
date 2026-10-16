import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { LENSES } from "@/data/lenses";
import { InlineScript } from "@/components/InlineScript";
import "@fontsource/shrikhand/latin-400.css";
import "@fontsource-variable/work-sans/wght.css";
import "./globals.css";

/** Runs before paint so the page never flashes the wrong theme. Day mode unless the user picked dark. */
const THEME_SCRIPT = `try{if(localStorage.getItem("lens-theme")!=="dark")document.documentElement.classList.add("light")}catch(e){document.documentElement.classList.add("light")}`;

export const metadata: Metadata = {
  title: { default: "Lens Catalog — a rental shop you can walk through", template: "%s · Lens Catalog" },
  description: `Walk through a 3D lens rental shop, take any of ${LENSES.length} camera lenses off the shelf and look at it up close. Sony, Canon, Nikon, Sigma, Tamron, Sirui, Laowa and more.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions and the theme script both modify <html>/<body> before React hydrates.
    <html lang="en" className={GeistMono.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
