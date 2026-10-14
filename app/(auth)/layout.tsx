import Link from "next/link";

import { ApplyMark } from "@/components/apply/ApplyMark";
import { AuthScene } from "@/components/auth/AuthScene";
import { PageTransition } from "@/components/PageTransition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full bg-[#0a0a0f]">
      <ApplyMark />
      <AuthScene />

      <main className="flex w-full items-center justify-center px-6 py-20 lg:max-w-xl lg:px-12">
        <div className="w-full max-w-md">
          <PageTransition>{children}</PageTransition>
          <Link
            href="https://hackcanada.org"
            target="_blank"
            className="mt-8 block text-center text-sm text-white/50 transition-colors hover:text-white"
          >
            Back to hackcanada.org
          </Link>
        </div>
      </main>
    </div>
  );
}
