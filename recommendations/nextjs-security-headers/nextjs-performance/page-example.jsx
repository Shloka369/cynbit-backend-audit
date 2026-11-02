// Performance fixes for findings F-11 to F-13 (Next.js App Router)
import Image from "next/image";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";

// F-12: self-hosted font, no render-blocking font CSS request
const inter = Inter({ subsets: ["latin"], display: "swap" });

// F-13: load heavy below-the-fold sections only when needed
const CaseStudies = dynamic(() => import("./CaseStudies"), { ssr: true });

export default function Home() {
  return (
    <main className={inter.className}>
      {/* F-11: preload the LCP hero image with explicit dimensions */}
      <Image src="/hero.webp" alt="Cynbit hero" width={1200} height={630} priority />
      <CaseStudies />
    </main>
  );
}