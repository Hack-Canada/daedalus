"use client";

import { useEffect, useRef, useState } from "react";

// Matches the beaver in /logo-circle.png
const FUR = "#9A6249";
const FUR_DARK = "#7E4127";
const PINK = "#E09F94";
const MUZZLE = "#D59A86";

export function PeekingBeaver({ line }: { line?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: -2, y: 1 });
  const [blink, setBlink] = useState(false);
  const [quietFor, setQuietFor] = useState<string>();
  const said = Boolean(line) && quietFor !== line;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = event.clientX - (box.left + box.width * 0.45);
      const dy = event.clientY - (box.top + box.height * 0.45);
      const len = Math.hypot(dx, dy) || 1;
      setLook({ x: (dx / len) * 3, y: (dy / len) * 3 });
    };

    let timer = 0;
    const scheduleBlink = () => {
      timer = window.setTimeout(
        () => {
          setBlink(true);
          window.setTimeout(() => setBlink(false), 140);
          scheduleBlink();
        },
        2500 + Math.random() * 3000,
      );
    };
    scheduleBlink();
    window.addEventListener("pointermove", onMove);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    if (!line) return;
    const timer = window.setTimeout(() => setQuietFor(line), 4500);
    return () => window.clearTimeout(timer);
  }, [line]);

  const eye = (cx: number, cy: number) => (
    <g>
      {blink ? (
        <path
          d={`M${cx - 6} ${cy} q6 4 12 0`}
          stroke="#1a1a1a"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <circle cx={cx} cy={cy} r={7.5} fill="#1a1a1a" />
          <circle
            cx={cx + look.x - 1.5}
            cy={cy + look.y - 2}
            r={2.4}
            fill="#fff"
          />
        </>
      )}
    </g>
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-0 bottom-[14vh] z-10 hidden xl:block"
    >
      <div
        className={`absolute right-36 bottom-[7.5rem] w-max max-w-44 rounded-2xl rounded-br-sm bg-white px-3.5 py-2 text-sm font-medium text-[#3a2418] shadow-lg transition-all duration-300 motion-reduce:transition-none ${
          said ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {line}
      </div>
      <div className="animate-beaver-peek motion-reduce:animate-none">
        <svg
          ref={ref}
          viewBox="0 0 170 175"
          className="pointer-events-auto w-40 origin-right translate-x-8 -rotate-[14deg] transition-transform duration-300 ease-out hover:translate-x-20"
        >
          {/* ears */}
          <circle cx={52} cy={40} r={17} fill={FUR} />
          <circle cx={52} cy={40} r={9} fill={PINK} />
          <circle cx={138} cy={36} r={17} fill={FUR} />
          <circle cx={138} cy={36} r={9} fill={PINK} />
          {/* head */}
          <ellipse cx={96} cy={96} rx={70} ry={64} fill={FUR} />
          {/* cheeks */}
          <circle cx={46} cy={112} r={13} fill={FUR_DARK} opacity={0.75} />
          <circle cx={144} cy={112} r={13} fill={FUR_DARK} opacity={0.75} />
          {eye(68, 88)}
          {eye(122, 88)}
          {/* muzzle */}
          <path
            d="M96 104c-8 0-26 3-26 13 0 7 8 11 15 9 5-1 9-5 11-9 2 4 6 8 11 9 7 2 15-2 15-9 0-10-18-13-26-13z"
            fill={MUZZLE}
          />
          <path
            d="M86 102c2-6 6-7 10-7s8 1 10 7c0 3-6 8-10 8s-10-5-10-8z"
            fill="#1a1a1a"
          />
          {/* teeth */}
          <rect x={86} y={121} width={9} height={14} rx={2} fill="#fff" />
          <rect x={96.5} y={121} width={9} height={14} rx={2} fill="#fff" />
          {/* paws gripping the edge */}
          <ellipse cx={44} cy={150} rx={16} ry={12} fill={FUR} />
          <ellipse cx={88} cy={156} rx={16} ry={12} fill={FUR} />
          <path
            d="M36 148v6M44 147v7M52 148v6M80 154v6M88 153v7M96 154v6"
            stroke={FUR_DARK}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
