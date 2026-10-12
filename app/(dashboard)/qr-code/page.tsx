import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { QRCodeSVG } from "qrcode.react";

import { QR_LOGO_SRC } from "@/config/qr-code";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { EmptyPage } from "@/components/EmptyPage";
import PageWrapper from "@/components/PageWrapper";
import { QRCodeActions } from "@/components/qr-code/QRCodeActions";

export default async function QRCodePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    redirect("/sign-in");
  }

  if (currentUser.role === "unassigned") {
    return (
      <EmptyPage
        title="QR Code Page"
        message="Sorry, this feature is only available to participants."
      />
    );
  }

  const profileUrl = `https://app.hackcanada.org/profile/${currentUser.id}`;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="from-primary to-primary w-fit bg-linear-to-r via-sky-400 bg-clip-text text-transparent">
            <h1 className="font-rubik text-3xl font-bold">Your QR Code</h1>
          </div>
          <p className="text-textMuted max-md:text-sm">
            Use this QR code for event check-ins and sharing your public
            profile!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          {/* QR Code Section */}
          <div className="w-full max-w-2xl">
            <div
              className="group border-primary/20 hover:border-primary/40 relative flex h-full flex-col gap-6 overflow-hidden rounded-lg border bg-white/50 p-6 transition-all duration-500 hover:shadow-lg md:p-8"
              role="region"
              aria-label="QR Code Display"
            >
              <div className="pointer-events-none absolute inset-0 -z-10">
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

                {/* Animated gradient background */}
                <div className="from-info/30 via-primaryLight/30 to-primary/30 absolute inset-0 bg-linear-to-br opacity-50 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />

                {/* Mesh gradient pattern */}
                <div className="absolute inset-0 opacity-0 mix-blend-normal transition-all duration-700 group-hover:opacity-80">
                  <div className="absolute inset-0 bg-[radial-gradient(at_70%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(at_30%_80%,rgba(59,130,246,0.3),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_80%_50%,rgba(59,130,246,0.25),transparent_25%)]" />
                </div>

                {/* Noise texture */}
                <div className="absolute inset-0 opacity-5 mix-blend-soft-light transition group-hover:opacity-20">
                  <Image
                    src="/grainy-texture.jpg"
                    alt="Grainy texture"
                    fill
                    sizes="50px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* QR Code Content */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={cn(
                      "relative z-10 overflow-hidden rounded-xl border bg-white p-4 shadow-lg md:p-6",
                      "hover:shadow-primary/25 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl",
                      "group-hover:border-primary/40",
                    )}
                  >
                    {/* Subtle animated background */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)]" />
                    </div>

                    <QRCodeSVG
                      data-qr-code="true"
                      value={profileUrl}
                      size={225}
                      level="H"
                      imageSettings={{
                        src: QR_LOGO_SRC,
                        height: 60,
                        width: 60,
                        excavate: true,
                      }}
                    />
                  </div>

                  <div className="max-w-md text-center">
                    <p className="text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-700 md:text-base">
                      Save this QR code to your device for quick and easy access
                      during the event. You&apos;ll need it for check-ins and
                      other activities!
                    </p>
                  </div>

                  <QRCodeActions
                    userId={currentUser.id}
                    userName={currentUser.name || "Hacker"}
                    userEmail={currentUser.email || ""}
                    profileUrl={profileUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackButton />
    </PageWrapper>
  );
}
