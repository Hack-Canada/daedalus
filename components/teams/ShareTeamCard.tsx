"use client";

import { useState } from "react";
import { Check, Copy, Download, Link2, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  CARD_CTAS,
  CARD_SIZES,
  CardCta,
  cardHeadline,
  cardQuery,
  CardSize,
} from "@/lib/apply/team-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const pill =
  "cursor-pointer rounded-full border border-white/15 px-3 py-2 text-sm text-white/75 transition-colors hover:border-white/35 peer-checked:border-sky-300 peer-checked:bg-sky-300/15 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-white";

export function ShareTeamCard({
  teamName,
  invitePath,
  lookingFor,
  spotsLeft,
  isOwner,
}: {
  teamName: string;
  invitePath: string;
  lookingFor: string;
  spotsLeft: number;
  isOwner: boolean;
}) {
  const [shown, setShown] = useState(false);
  const [cta, setCta] = useState<CardCta>("looking");
  const [looking, setLooking] = useState(Boolean(lookingFor));
  const [size, setSize] = useState<CardSize>("square");
  const [loadedSrc, setLoadedSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const token = invitePath.split("/").pop() ?? "";
  const options = { cta, looking: looking && Boolean(lookingFor), size };
  const imageSrc = `/api/teams/card?token=${encodeURIComponent(token)}&${cardQuery(options)}`;
  const shareUrl = () =>
    `${window.location.origin}${invitePath}?${cardQuery({ ...options, size: "wide" })}`;
  const shareText = (lookingMax: number) => {
    const base = `${cardHeadline(cta, spotsLeft)}: ${teamName} at Hack Canada.`;
    if (!options.looking) return `${base} Ask to join:`;
    const note =
      lookingFor.length > lookingMax
        ? `${lookingFor.slice(0, lookingMax - 1).trimEnd()}…`
        : lookingFor;
    return `${base} We are looking for: ${note} Ask to join:`;
  };
  const canCopyImage =
    typeof window !== "undefined" &&
    "ClipboardItem" in window &&
    !!navigator.clipboard?.write;
  const fileName = `${teamName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "team"}-hack-canada.png`;
  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  async function cardFile() {
    const res = await fetch(imageSrc);
    if (!res.ok) throw new Error("Card failed to load");
    return new File([await res.blob()], fileName, { type: "image/png" });
  }

  async function act(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("That did not work. Try Save image instead.");
    } finally {
      setBusy(false);
    }
  }

  const save = () =>
    act(async () => {
      const url = URL.createObjectURL(await cardFile());
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: fileName,
      });
      link.click();
      URL.revokeObjectURL(url);
    });

  const nativeShare = () =>
    act(async () => {
      const file = await cardFile();
      const data = { title: teamName, text: shareText(280), url: shareUrl() };
      await navigator.share(
        navigator.canShare?.({ files: [file] })
          ? { ...data, files: [file] }
          : data,
      );
    });

  const copy = () =>
    act(async () => {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  // The blob promise goes straight into ClipboardItem so Safari keeps the click's permission.
  const copyImage = () =>
    navigator.clipboard.write([
      new ClipboardItem({
        "image/png": cardFile().then((file) => file as Blob),
      }),
    ]);

  const copyImageOnly = () =>
    act(async () => {
      await copyImage();
      toast.success("Image copied. Paste it into your post.");
    });

  // X and LinkedIn take text and a link, never an image file. Their preview card comes
  // from the link's og:image, so the image is also copied for a one-paste attach.
  const postTo = (network: "x" | "linkedin") =>
    act(async () => {
      const url =
        network === "x"
          ? `https://x.com/intent/post?${new URLSearchParams({
              text: shareText(150),
              url: shareUrl(),
            })}`
          : `https://www.linkedin.com/feed/?${new URLSearchParams({
              shareActive: "true",
              text: `${shareText(280)} ${shareUrl()}`,
            })}`;
      let imageCopied = false;
      if (canCopyImage) {
        imageCopied = await copyImage().then(
          () => true,
          () => false,
        );
      }
      const tab = window.open(url, "_blank");
      if (tab) tab.opener = null;
      else window.location.href = url;
      if (imageCopied) {
        toast.success(
          "Card image copied. Paste it into your post with Ctrl+V.",
          {
            duration: 6000,
          },
        );
      }
    });

  return (
    <>
      <Button
        type="button"
        className="min-h-12 w-full gap-2 rounded-xl bg-white text-base text-[#043251] hover:bg-white/90"
        onClick={() => setShown(true)}
      >
        <Sparkles className="size-4" aria-hidden />
        Make a share card
      </Button>
      <Dialog open={shown} onOpenChange={setShown}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-normal">
              Share {teamName}
            </DialogTitle>
            <DialogDescription>
              Post it anywhere. The link opens your team page, where people ask
              to join.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem]">
            <div
              className={cn(
                "relative mx-auto w-full self-start overflow-hidden rounded-xl bg-sky-300/10",
                size === "square"
                  ? "aspect-square max-w-[min(100%,60dvh)]"
                  : "aspect-[1200/630]",
              )}
            >
              {loadedSrc && loadedSrc !== imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loadedSrc}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-50 transition-opacity"
                />
              )}
              {!loadedSrc && (
                <div
                  className="absolute inset-0 animate-pulse bg-linear-to-b from-sky-400/25 to-sky-700/25 motion-reduce:animate-none"
                  aria-hidden
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imageSrc}
                src={imageSrc}
                alt={`${cardHeadline(cta, spotsLeft)}. ${teamName}.`}
                width={CARD_SIZES[size].width}
                height={CARD_SIZES[size].height}
                onLoad={() => setLoadedSrc(imageSrc)}
                className={cn(
                  "relative size-full object-cover transition-opacity duration-300",
                  loadedSrc === imageSrc ? "opacity-100" : "opacity-0",
                )}
              />
            </div>

            <div className="space-y-5">
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm text-white/55">Message</legend>
                <div className="flex flex-wrap gap-2">
                  {CARD_CTAS.map((option) => (
                    <label key={option.id}>
                      <input
                        type="radio"
                        name="card-cta"
                        value={option.id}
                        checked={cta === option.id}
                        onChange={() => setCta(option.id)}
                        className="peer sr-only"
                      />
                      <span className={cn(pill, "block")}>
                        {cardHeadline(option.id, spotsLeft)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm text-white/55">Format</legend>
                <div className="flex gap-2">
                  {(Object.keys(CARD_SIZES) as CardSize[]).map((key) => (
                    <label key={key}>
                      <input
                        type="radio"
                        name="card-size"
                        value={key}
                        checked={size === key}
                        onChange={() => setSize(key)}
                        className="peer sr-only"
                      />
                      <span className={cn(pill, "block")}>
                        {CARD_SIZES[key].label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="card-looking"
                  checked={options.looking}
                  disabled={!lookingFor}
                  onCheckedChange={(value) => setLooking(value === true)}
                  aria-describedby={lookingFor ? undefined : "card-looking-why"}
                />
                <label htmlFor="card-looking" className="text-sm text-white">
                  Show what you are looking for
                  {!lookingFor && (
                    <span id="card-looking-why" className="block text-white/45">
                      {isOwner
                        ? "Write it in Settings first."
                        : "The owner has not written it yet."}
                    </span>
                  )}
                </label>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-5">
                <div className="grid grid-cols-2 gap-2">
                  {canNativeShare && (
                    <Button
                      type="button"
                      className="col-span-2 min-h-11 gap-2"
                      disabled={busy}
                      onClick={() => void nativeShare()}
                    >
                      <Share2 className="size-4" aria-hidden />
                      Share
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={canNativeShare ? "outline" : "default"}
                    className={cn(
                      "min-h-11 gap-2",
                      !canCopyImage && "col-span-2",
                    )}
                    disabled={busy}
                    onClick={() => void save()}
                  >
                    <Download className="size-4" aria-hidden />
                    Save
                  </Button>
                  {canCopyImage && (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 gap-2"
                      disabled={busy}
                      onClick={() => void copyImageOnly()}
                    >
                      <Copy className="size-4" aria-hidden />
                      Copy image
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="col-span-2 min-h-11 gap-2"
                    onClick={() => void copy()}
                  >
                    {copied ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      <Link2 className="size-4" aria-hidden />
                    )}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    disabled={busy}
                    onClick={() => void postTo("x")}
                  >
                    Post on X
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    disabled={busy}
                    onClick={() => void postTo("linkedin")}
                  >
                    LinkedIn
                  </Button>
                </div>
                <p className="text-xs text-white/45">
                  {canCopyImage
                    ? "X and LinkedIn open with your text filled in and the image copied. Paste it into the post."
                    : "X and LinkedIn open with your text filled in. Save the image to attach it."}{" "}
                  For Instagram or Discord, save the image.
                </p>
                {error && (
                  <p role="alert" className="text-sm text-red-300">
                    {error}
                  </p>
                )}
                <span role="status" className="sr-only">
                  {copied ? "Link copied" : ""}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
