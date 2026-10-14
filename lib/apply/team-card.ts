export const CARD_CTAS = [
  { id: "looking", label: "We're looking for teammates" },
  { id: "join", label: "Join our team" },
  { id: "spots", label: "Spots open" },
  { id: "build", label: "Come build with us" },
  { id: "hack", label: "Hack Canada with us" },
] as const;

export type CardCta = (typeof CARD_CTAS)[number]["id"];

export const CARD_SIZES = {
  square: { width: 1080, height: 1080, label: "Square" },
  wide: { width: 1200, height: 630, label: "Wide" },
} as const;

export type CardSize = keyof typeof CARD_SIZES;

export type CardOptions = { cta: CardCta; looking: boolean; size: CardSize };

type RawOptions = {
  cta?: string | string[] | null;
  looking?: string | string[] | null;
  size?: string | string[] | null;
};

const first = (value: RawOptions[keyof RawOptions]) =>
  Array.isArray(value) ? value[0] : (value ?? undefined);

export function parseCardOptions(raw: RawOptions): CardOptions {
  const cta = first(raw.cta);
  const size = first(raw.size);
  return {
    cta: CARD_CTAS.some((option) => option.id === cta)
      ? (cta as CardCta)
      : "looking",
    looking: first(raw.looking) === "1",
    size: size === "wide" ? "wide" : "square",
  };
}

export function cardQuery({ cta, looking, size }: CardOptions) {
  return new URLSearchParams({ cta, looking: looking ? "1" : "0", size });
}

export function cardHeadline(cta: CardCta, spotsLeft: number) {
  if (cta === "spots") {
    if (spotsLeft <= 0) return "Our team is full";
    return spotsLeft === 1 ? "1 spot open" : `${spotsLeft} spots open`;
  }
  return CARD_CTAS.find((option) => option.id === cta)!.label;
}
