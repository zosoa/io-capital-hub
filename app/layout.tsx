import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import CookieBanner from "@/components/legal/CookieBanner";

export const metadata: Metadata = {
  title: "CEO Summit Investment Hub — Plateforme de Financement Privée",
  description: "Soumettez votre dossier de financement. Notre équipe du Cluster Capital & Finance du CEO Summit Indian Ocean vous met en relation avec les bons investisseurs — en toute confidentialité.",
  keywords: "financement, investissement, CEO Summit, Océan Indien, Madagascar, PME, capital, equity, private equity, impact",
  openGraph: {
    title: "CEO Summit Investment Hub",
    description: "La plateforme de financement privée du CEO Summit Indian Ocean",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
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
