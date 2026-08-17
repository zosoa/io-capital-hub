import type { Metadata } from "next";
import "./landing.css";
import LandingContent from "./landing-content";
import { fr } from "./i18n/landing";

export const metadata: Metadata = {
  title: fr.meta.title,
  description: fr.meta.description,
  alternates: { canonical: "/", languages: { fr: "/", en: "/en" } },
};

export default function LandingPage() {
  return <LandingContent t={fr} locale="fr" />;
}
