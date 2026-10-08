import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Suspense } from "react";
import { AppShell } from "../components/app-shell";
import { BrandingBridge, BrandingProvider } from "../components/branding-bridge";
import { DemoBanner } from "../components/demo-banner";
import { OfferBar } from "../components/offer-bar";
import { AppProviders } from "../components/providers";
import { brandingFromHeaders, previewMetadata } from "../lib/demo/metadata";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const arabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await brandingFromHeaders();
  return previewMetadata(branding.name, branding.personalized);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const branding = await brandingFromHeaders();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={arabic.variable}
      suppressHydrationWarning
    >
      <body className={`${sans.className} text-zinc-900 antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <BrandingProvider initial={branding}>
              <BrandingBridge />
              <Suspense fallback={null}>
                <DemoBanner />
              </Suspense>
              <AppShell>{children}</AppShell>
              <OfferBar />
            </BrandingProvider>
          </AppProviders>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
