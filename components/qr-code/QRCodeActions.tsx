"use client";

import { useState } from "react";
import { Download, Mail } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

import { QR_LOGO_SRC } from "@/config/qr-code";
import { Button } from "@/components/ui/button";

interface QRCodeActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  profileUrl: string;
}

export function QRCodeActions({
  userId,
  userName,
  userEmail,
  profileUrl,
}: QRCodeActionsProps) {
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const size = 300;
      const logoSize = 70;
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, profileUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";

        await new Promise<void>((resolve) => {
          logoImg.onload = () => {
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(
              logoX + logoSize / 2,
              logoY + logoSize / 2,
              logoSize / 2 + 4,
              0,
              Math.PI * 2,
            );
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.arc(
              logoX + logoSize / 2,
              logoY + logoSize / 2,
              logoSize / 2,
              0,
              Math.PI * 2,
            );
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            resolve();
          };
          logoImg.onerror = () => {
            console.warn("Could not load logo, continuing without it");
            resolve();
          };
          logoImg.src = QR_LOGO_SRC;
        });
      }

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `hack-canada-qr-${userName.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("QR code downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsEmailSending(true);
    try {
      const response = await fetch("/api/qr-code/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send email");
      }

      toast.success(`QR code sent to ${userEmail}`);
    } catch (error) {
      console.error("Email error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send email",
      );
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="gap-2 border-slate-300 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Downloading..." : "Download"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSendEmail}
        disabled={isEmailSending}
        className="gap-2 border-slate-300 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900"
      >
        <Mail className="h-4 w-4" />
        {isEmailSending ? "Sending..." : "Send to Email"}
      </Button>
    </div>
  );
}
