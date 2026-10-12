import Image from "next/image";
import { QrCode, ScanQrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { QR_LOGO_SRC } from "@/config/qr-code";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LockedState from "./LockedState";

interface DashboardQRCodeProps {
  isLocked: boolean;
  userId: string;
}

const DashboardQRCode = ({ isLocked, userId }: DashboardQRCodeProps) => {
  const profileUrl = `https://app.hackcanada.org/profile/${userId}`;

  return (
    <div className="lg:col-span-2">
      <div
        className={`group relative flex h-full min-h-[250px] flex-col gap-0 overflow-hidden rounded-xl border bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 ${
          isLocked
            ? "border-white/10"
            : "border-white/10 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(30,144,255,0.15)]"
        }`}
      >
        {/* Gradient overlay */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
          isLocked 
            ? "from-white/5 via-transparent to-transparent opacity-50"
            : "from-primary/10 via-info/5 to-transparent opacity-50 group-hover:opacity-75"
        }`} />

        {isLocked && <LockedState label="Participants Only" />}

        <div className="relative z-10 mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-white">
            Your VIP Pass! 🎫
          </h2>
          <QrCode className="size-8 text-white/70 transition-all duration-500 group-hover:text-primary md:size-8" />
        </div>

        <p className="relative z-10 pb-8 text-white/60">
          Your golden ticket to the hackathon! Use it for speedy check-ins and to share your awesome profile with new friends.
        </p>

        <div className="relative z-10 mt-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                disabled={isLocked}
                variant={isLocked ? "outline" : "primary"}
                className={`inline-flex items-center gap-2 ${
                  isLocked
                    ? "pointer-events-none cursor-not-allowed !text-white/30 opacity-40 hover:bg-transparent"
                    : ""
                }`}
              >
                Show My Pass
                <QrCode className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="group flex max-w-sm flex-col items-center overflow-hidden border border-primary/50 bg-[#12121a]">
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-info/20 to-primary/30">
                <span className="absolute -top-4 left-20 h-16 w-[500px] -translate-x-40 -rotate-[20deg] border-y border-white/20 bg-white/10 backdrop-blur-[0.5px]" />
                <span className="absolute -bottom-4 -left-4 size-20 rotate-[20deg] rounded-lg bg-primary/15" />
                <span className="absolute -bottom-4 left-2 size-16 rotate-[20deg] rounded-lg bg-primary/15" />
                <span className="absolute inset-x-0 -top-0.5 h-[3px] bg-linear-to-r from-transparent via-primary to-transparent" />
                <span className="absolute inset-x-0 -bottom-0.5 h-[3px] bg-linear-to-r from-transparent via-primary to-transparent" />
                <ScanQrCode className="absolute -bottom-2 -right-2 size-16 -rotate-[12deg] text-white opacity-30 transition-transform duration-500 group-hover:-rotate-[30deg]" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-white md:text-xl">Your VIP Pass 🎫</DialogTitle>
              </DialogHeader>
              <div className="relative z-50 mt-4 rounded-lg border border-white/20 bg-white p-2.5 shadow-xl shadow-primary/25 sm:p-4">
                <QRCodeSVG
                  value={profileUrl}
                  size={225}
                  level="H"
                  imageSettings={{
                    src: QR_LOGO_SRC,
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                />
              </div>
              <p className="mt-4 text-balance text-center text-sm text-white/60">
                Flash this at check-in for express entry! Share it to connect with fellow hackers ✨
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default DashboardQRCode;
