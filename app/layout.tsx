import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import CookieBanner from "@/components/legal/CookieBanner";

export const metadata: Metadata = {
  title: "KAPEX — Kapital Exchange Portal · Financement privé de l'Océan Indien",
  description: "KAPEX met en relation les projets bancables de l'Océan Indien avec les fonds, family offices et banques qualifiés — en toute confidentialité. Une initiative du CEO Summit Indian Ocean.",
  keywords: "KAPEX, financement, investissement, capital privé, CEO Summit, Océan Indien, Madagascar, Maurice, PME, equity, private equity, impact",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "KAPEX — Kapital Exchange Portal",
    description: "Le portail de capital privé de l'Océan Indien. Une initiative du CEO Summit Indian Ocean.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0C1F36",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieBanner/>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#0D0F1C", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}
