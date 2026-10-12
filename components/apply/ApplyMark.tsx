import Image from "next/image";

export function ApplyMark() {
  return (
    <Image
      src="/logo-circle.png"
      alt="Hack Canada"
      width={40}
      height={40}
      className="pointer-events-none fixed top-4 left-4 z-20 h-10 w-10"
    />
  );
}
