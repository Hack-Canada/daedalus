import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

import { getPhaseState } from "@/lib/phase";
import Navbar from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import Sidebar from "@/components/sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

const EARLY_PHASES = new Set(["pre-registration", "registration-open"]);
const UNDECIDED = new Set(["not_applied", "pending"]);
const STAFF = new Set(["admin", "organizer", "mentor", "volunteer"]);

const DashboardLayout = async ({ children }: Props) => {
  const [{ phase }, user] = await Promise.all([
    getPhaseState(),
    getCurrentUser(),
  ]);
  // Applicants stay on /apply until their decision is released (status leaves pending).
  const early =
    EARLY_PHASES.has(phase) ||
    (phase === "pre-event" &&
      !!user &&
      UNDECIDED.has(user.status) &&
      !STAFF.has(user.role));

  if (early) {
    const path = (await headers()).get("x-pathname") ?? "";
    if (path && !path.startsWith("/apply")) redirect("/apply");

    return (
      <div className="relative min-h-dvh bg-[#0a0a0f]">
        <PageTransition>{children}</PageTransition>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex-1 bg-[#0a0a0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[800px] rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl" />
        <div className="absolute -top-1/4 left-1/4 h-[500px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[600px] rounded-full bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute right-1/4 -bottom-1/4 h-[400px] w-[500px] rounded-full bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent blur-3xl" />
      </div>

      <Image
        src="/grainy-texture.jpg"
        fill
        alt=""
        className="pointer-events-none fixed inset-0 object-cover opacity-[0.03]"
      />

      <Sidebar />
      <main className="relative z-10 h-full max-lg:mt-16 lg:ml-72">
        <Navbar />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
};

export default DashboardLayout;
