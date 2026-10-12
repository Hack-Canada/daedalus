import Image from "next/image";
import Link from "next/link";

import { AnimatedSnowflake } from "@/components/ui/AnimatedSnowflake";
import { PageTransition } from "@/components/PageTransition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-neutral-900 p-6">
      {/* Aurora background */}
      <Image
        src="/aurora.webp"
        width={1000}
        height={40}
        alt="Aurora background"
        className="animate-aurora pointer-events-none absolute top-0 right-0 w-[100%] object-contain opacity-90"
      />
      {/* Gradient fade for aurora bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-b from-transparent via-transparent to-neutral-900" />

      {/* Snowflakes */}

      {/* Additional Animated Snowflakes */}
      <AnimatedSnowflake className="-top-40 -left-40 scale-75" />
      <AnimatedSnowflake className="top-0 right-0 scale-150" />
      <AnimatedSnowflake className="inset-x-0 bottom-0 scale-150" />
      {/* <AnimatedSnowflake className="right-0 bottom-0 scale-150 opacity-50" /> */}
      <AnimatedSnowflake className="-right-40 -bottom-40 scale-75 opacity-50" />

      {/* Grainy texture */}
      <Image
        src="/grainy-texture.jpg"
        fill
        alt="Grainy texture"
        className="pointer-events-none absolute inset-0 object-cover opacity-5"
      />

      <div className="relative z-10 w-full max-w-md">
        <PageTransition>{children}</PageTransition>
        <div className="mt-6 text-center">
          <Link
            href="https://hackcanada.org"
            target="_blank"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
