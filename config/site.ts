export const hackathonYear = 2027;

export const siteConfig = {
  metadataBase: new URL("https://app.hackcanada.org"),
  title: `Hack Canada ${hackathonYear}`,
  description:
    "Official Hack Canada Hacker Portal - Apply to Canada's premier hackathon, manage your application, access your hacker package, and join 500+ innovators. HC Hacker Portal for Hack Canada applications, RSVP, and event registration.",
  openGraph: {
    title: `Hack Canada ${hackathonYear} Hacker Portal | HC Applications`,
    description: `Join Hack Canada ${hackathonYear}! Apply through the official hacker portal, submit your hackathon application, and be part of Canada's biggest student hackathon community.`,
    type: "website",
    locale: "en_CA",
    siteName: "Hack Canada Hacker Portal",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1500,
        height: 1000,
        alt: `Hack Canada ${hackathonYear} Hacker Portal - Apply Now`,
      },
    ],
  },
  keywords: [
    // Primary brand keywords
    "Hack Canada",
    "Hack Canada Hacker Portal",
    "HC Hacker Portal",
    "Hack Canada Portal",
    "HackCanada",

    // Application-focused keywords
    "Hack Canada applications",
    "Hack Canada apps",
    "Hack Canada apply",
    "Hack Canada registration",
    "Hack Canada sign up",
    "HC applications",
    "HC apply",

    // Hackathon + location keywords
    "hackathon Canada",
    "Canadian hackathon",
    "Canada hackathon 2027",
    "hackathon Ontario",
    "hackathon Waterloo",
    "hackathon Toronto",
    "Waterloo hackathon",
    "Toronto hackathon",

    // University-specific keywords
    "Wilfrid Laurier hackathon",
    "Laurier hackathon",
    "WLU hackathon",
    "university hackathon Canada",
    "student hackathon Canada",

    // MLH keywords
    "MLH hackathon",
    "MLH hackathon Canada",
    "MLH Canada",
    "Major League Hacking Canada",
    "MLH member event",

    // General hackathon keywords
    "hackathon",
    "canada",
    "programming",
    "coding",
    "hackers",
    "technology",
    "innovation",
    "hack canada",
    "coding competition",
    "programming competition",
    "tech hackathon",
    "innovation challenge",

    // Activity keywords
    "hackathon registration",
    "hackathon application",
    "apply to hackathon",
    "join hackathon",
    "hackathon portal",
    "hacker dashboard",

    // Community keywords
    "Hackathons Canada",
    "Canadian hacker community",
    "student developers Canada",

    // Year-specific
    `Hack Canada ${hackathonYear}`,
    `hackathon ${hackathonYear}`,
    `Canada hackathon ${hackathonYear}`,
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
};

// URLs and external links
export const discordInviteUrl: string = "https://discord.gg/52Ev4CCUxe";
export const hackathonsCanadaDiscordUrl: string =
  "https://discord.gg/52Ev4CCUxe";
export const viewProjectsUrl: string = "https://hack-canada-2026.devpost.com/";
export const hackerPackageUrl: string =
  "https://hack-canada-2026.notion.site/Hack-Canada-2026-Hacker-Package-2de5d88c3a2180aaa469e760de714317#3165d88c3a2180fa9fc0e4f75ebf34e0";
export const devpostUrl: string = "https://hack-canada-2026.devpost.com/";
export const eventGalleryUrl: string =
  process.env.NEXT_PUBLIC_GALLERY_URL || "";
