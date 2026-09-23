import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AppShell } from "../components/app-shell";
import { DemoBanner } from "../components/demo-banner";
import { AppProviders } from "../components/providers";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${sans.className} bg-zinc-50 text-zinc-900 antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <Suspense fallback={null}>
              <DemoBanner />
            </Suspense>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
