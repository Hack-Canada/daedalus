import React from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
  mobile?: boolean;
  dark?: boolean;
};

const SidebarLogo = ({ className, mobile, dark = true }: Props) => {
  return (
    <Link
      href={"/"}
      className={`flex w-fit cursor-pointer items-center space-x-2 ${className}`}
    >
      <Image
        src={"/hack-canada-logo.png"}
        alt="Hack Canada Logo"
        width={48}
        height={48}
        className={mobile ? "translate-y-1" : ""}
      />
      <span className="flex max-lg:space-x-1 lg:flex-col lg:-space-y-1">
        <span className={`text-xl font-bold lg:text-lg ${dark ? "text-white" : "text-[#071632]"}`}>
          Hack
        </span>
        <span className={`text-xl font-bold lg:text-lg ${dark ? "text-white" : "text-[#071632]"}`}>
          Canada
        </span>
      </span>
    </Link>
  );
};

export default SidebarLogo;
