import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Therapia Global",
    default: "Therapia Global",
  },
  description: "The global standard for physical therapists, osteopaths and health students.",
  metadataBase: new URL("https://therapia.global"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
