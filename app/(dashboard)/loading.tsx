import Image from "next/image";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[80dvh] items-center justify-center"
    >
      <Image
        src="/hack-canada-logo.png"
        alt=""
        width={56}
        height={56}
        className="motion-safe:animate-bob size-14 rounded-full"
      />
    </div>
  );
}
