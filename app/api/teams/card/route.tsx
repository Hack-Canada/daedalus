import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { MAX_TEAM_SIZE } from "@/config/apply";
import {
  CARD_SIZES,
  cardHeadline,
  parseCardOptions,
} from "@/lib/apply/team-card";
import { getTeamCard } from "@/lib/db/queries/team";

const NAVY = "#043251";
const LOOKING_FOR_MAX = 150;

let logo: Promise<string> | null = null;
function loadLogo() {
  logo ??= readFile(path.join(process.cwd(), "public", "logo-circle.png")).then(
    (file) => `data:image/png;base64,${file.toString("base64")}`,
  );
  return logo;
}

// ponytail: fonts come from Google Fonts on first render, then live in memory.
// If Google is unreachable the card falls back to the default font. Bundle the
// .ttf files if that ever matters.
const fonts = new Map<string, Promise<ArrayBuffer | null>>();
function loadFont(family: string, weight: number) {
  const key = `${family}:${weight}`;
  let font = fonts.get(key);
  if (!font) {
    font = fetch(
      `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@${weight}`,
    )
      .then((res) => res.text())
      .then((css) => {
        const url = css.match(
          /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
        )?.[1];
        if (!url) throw new Error(`No ttf for ${key}`);
        return fetch(url);
      })
      .then((res) => res.arrayBuffer())
      .catch((error) => {
        fonts.delete(key);
        console.error("Team card font failed", error);
        return null;
      });
    fonts.set(key, font);
  }
  return font;
}

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  const puff = (left: number, top: number, w: number, h: number) => (
    <div
      style={{
        position: "absolute",
        left: left * s,
        top: top * s,
        width: w * s,
        height: h * s,
        borderRadius: 9999,
        background: "#fff",
      }}
    />
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 240 * s,
        height: 100 * s,
        display: "flex",
        opacity: 0.75,
      }}
    >
      {puff(0, 44, 240, 56)}
      {puff(40, 8, 100, 92)}
      {puff(112, 24, 88, 76)}
    </div>
  );
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const card = await getTeamCard(params.get("token") ?? "");
  if (!card) return new Response("Not found", { status: 404 });

  const options = parseCardOptions({
    cta: params.get("cta"),
    looking: params.get("looking"),
    size: params.get("size"),
  });
  const { width, height } = CARD_SIZES[options.size];
  const wide = options.size === "wide";
  const headline = cardHeadline(options.cta, card.spotsLeft);
  const lookingFor =
    options.looking && card.lookingFor
      ? clip(card.lookingFor, LOOKING_FOR_MAX)
      : "";
  const host = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "").host;
    } catch {
      return "app.hackcanada.org";
    }
  })();

  const [logoSrc, display, body, bodyBold] = await Promise.all([
    loadLogo(),
    loadFont("Londrina Solid", 900),
    loadFont("Inter", 500),
    loadFont("Inter", 700),
  ]);
  const fontList = [
    display && { name: "Londrina", data: display, weight: 900 as const },
    body && { name: "Inter", data: body, weight: 500 as const },
    bodyBold && { name: "Inter", data: bodyBold, weight: 700 as const },
  ].filter((font) => !!font);

  const pad = wide ? 56 : 72;
  const headlineSize = wide
    ? headline.length > 18
      ? 76
      : 92
    : headline.length > 18
      ? 112
      : 136;
  const nameSize = wide
    ? card.name.length > 22
      ? 36
      : 46
    : card.name.length > 22
      ? 48
      : 64;
  const seaHeight = wide ? 150 : 210;

  const pips = (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: MAX_TEAM_SIZE }, (_, index) => (
          <div
            key={index}
            style={{
              width: wide ? 22 : 28,
              height: wide ? 22 : 28,
              borderRadius: 9999,
              background: index < card.memberCount ? NAVY : "transparent",
              border: `4px solid ${index < card.memberCount ? NAVY : "#fff"}`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: wide ? 24 : 30,
          fontWeight: 700,
          color: NAVY,
        }}
      >
        {options.cta === "spots"
          ? `${card.memberCount} of ${MAX_TEAM_SIZE} members`
          : `${card.memberCount} of ${MAX_TEAM_SIZE} · ${
              card.spotsLeft > 0
                ? `${card.spotsLeft} ${card.spotsLeft === 1 ? "spot" : "spots"} open`
                : "full team"
            }`}
      </div>
    </div>
  );

  const lookingBox = lookingFor ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: wide ? "24px 28px" : "28px 34px",
        borderRadius: 28,
        background: "rgba(255,255,255,0.82)",
        border: "3px solid rgba(255,255,255,0.95)",
        width: wide ? 420 : "100%",
      }}
    >
      <div
        style={{
          fontSize: wide ? 18 : 22,
          fontWeight: 700,
          letterSpacing: 3,
          color: "rgba(4,50,81,0.6)",
        }}
      >
        WHAT WE ARE LOOKING FOR
      </div>
      <div
        style={{
          fontSize: wide ? 24 : 30,
          lineHeight: 1.35,
          color: NAVY,
        }}
      >
        {lookingFor}
      </div>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      width={wide ? 220 : 240}
      height={wide ? 220 : 240}
      alt=""
      style={{
        borderRadius: 9999,
        border: "8px solid #fff",
        alignSelf: "flex-end",
        transform: "rotate(-8deg)",
      }}
    />
  );

  const title = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...(wide ? { flex: 1 } : {}),
      }}
    >
      <div
        style={{
          fontFamily: "Londrina",
          fontSize: headlineSize,
          lineHeight: 0.95,
          color: "#fff",
          textShadow: "0 6px 0 rgba(4,50,81,0.2)",
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontFamily: "Londrina",
          fontSize: nameSize,
          color: NAVY,
          marginTop: wide ? 18 : 28,
        }}
      >
        {card.name}
      </div>
      <div style={{ display: "flex", marginTop: wide ? 14 : 20 }}>{pips}</div>
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "Inter",
        background:
          "linear-gradient(180deg, #6FA6EA 0%, #9DC5F3 55%, #CFE3F9 100%)",
      }}
    >
      <Cloud x={wide ? 820 : 720} y={wide ? 404 : 790} s={wide ? 0.9 : 1.3} />
      <Cloud x={wide ? -40 : -50} y={wide ? 420 : 810} s={wide ? 0.75 : 1.1} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: seaHeight,
          borderTop: "8px solid rgba(255,255,255,0.7)",
          background: "linear-gradient(180deg, #4A8FDB 0%, #255FAE 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: pad,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={wide ? 56 : 72}
            height={wide ? 56 : 72}
            alt=""
            style={{ borderRadius: 9999, border: "4px solid #fff" }}
          />
          <div
            style={{
              fontFamily: "Londrina",
              fontSize: wide ? 36 : 46,
              color: "#fff",
              marginLeft: 18,
            }}
          >
            Hack Canada
          </div>
          <div
            style={{
              marginLeft: "auto",
              padding: wide ? "8px 20px" : "10px 26px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.35)",
              border: "2px solid rgba(255,255,255,0.7)",
              color: NAVY,
              fontSize: wide ? 20 : 24,
              fontWeight: 700,
            }}
          >
            Team finder
          </div>
        </div>

        {wide ? (
          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: 36,
              alignItems: "flex-start",
            }}
          >
            {title}
            {lookingBox}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 64,
              gap: 40,
            }}
          >
            {title}
            {lookingBox}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: wide ? 20 : 26,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Ask to join at
            </div>
            <div
              style={{
                fontFamily: "Londrina",
                fontSize: wide ? 34 : 46,
                color: "#fff",
              }}
            >
              {host}
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: wide ? 76 : 100,
              height: wide ? 76 : 100,
              borderRadius: 9999,
              background: NAVY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid rgba(255,255,255,0.85)",
            }}
          >
            <svg
              width={wide ? 34 : 44}
              height={wide ? 34 : 44}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>,
    {
      width,
      height,
      fonts: fontList,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}
