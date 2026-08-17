import type { Metadata } from "next";
import "../landing.css";
import LandingContent from "../landing-content";
import { en } from "../i18n/landing";

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  alternates: { canonical: "/en", languages: { fr: "/", en: "/en" } },
};

export default function LandingPageEn() {
  return <LandingContent t={en} locale="en" />;
}
