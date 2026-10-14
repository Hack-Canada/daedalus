import type { Metadata } from "next";

import "./globals.css";

import Script from "next/script";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

import { eventVenue, hackathonYear, siteConfig } from "@/config/site";
import { getActiveBanners } from "@/lib/db/queries/banner";
import { fredoka, londrina, rubik } from "@/lib/fonts";
import { getPhaseState } from "@/lib/phase";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { PhaseProvider } from "@/components/phase/PhaseProvider";
import { PhaseSwitcher } from "@/components/phase/PhaseSwitcher";
import { SiteBanner } from "@/components/SiteBanner";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.title}`,
    default: siteConfig.title,
  },
  description: siteConfig.description,
  metadataBase: siteConfig.metadataBase,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  keywords: siteConfig.keywords,
  robots: siteConfig.robots,
  alternates: {
    canonical: "./",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const banners = await getActiveBanners();
  const phase = await getPhaseState();
  const site = siteConfig.metadataBase.origin;
  const socials = [
    "https://hackcanada.org",
    "https://www.linkedin.com/company/hack-canada/",
    "https://www.instagram.com/hackcanada/",
    "https://x.com/hack_canada_",
  ];
  const organization = {
    "@type": "Organization",
    name: "Hack Canada",
    url: "https://hackcanada.org",
    logo: `${site}/logo-circle.png`,
    sameAs: socials,
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Hack Canada ${hackathonYear}`,
    description: siteConfig.description,
    startDate: phase.dates.eventStart,
    endDate: phase.dates.eventEnd,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: eventVenue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Toronto",
        addressRegion: "ON",
        addressCountry: "CA",
      },
    },
    organizer: organization,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      url: `${site}/apply`,
    },
    image: `${site}/opengraph-image`,
    url: site,
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hack Canada Hacker Portal",
    alternateName: ["HC Hacker Portal", "Hack Canada Portal", "HC Portal"],
    url: site,
    description: siteConfig.description,
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    ...organization,
    alternateName: "HC",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hi@hackcanada.org",
      contactType: "Customer Service",
      areaServed: "CA",
      availableLanguage: ["English", "French"],
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body className={cn("", fredoka.className, rubik.variable, londrina.variable)}>
        <PhaseProvider value={phase}>
          <SiteBanner banners={banners} />
          <Toaster richColors position="bottom-center" />
          <SessionProvider session={session}>
            <div className="flex h-full min-h-svh flex-col">{children}</div>
          </SessionProvider>
          {process.env.NODE_ENV === "development" ? <PhaseSwitcher /> : null}
        </PhaseProvider>
      </body>
      <Script id="clarity-script" strategy="afterInteractive">
        {`
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vcg0101ac4");`}
      </Script>
    </html>
  );
}
