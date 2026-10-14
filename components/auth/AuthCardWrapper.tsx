import { cn } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";

type Props = {
  children: React.ReactNode;
  className?: string;
  showTabs?: boolean;
  reserveHeight?: boolean;
};

const AuthCardWrapper = ({
  children,
  className,
  showTabs = true,
  reserveHeight = true,
}: Props) => {
  return (
    <div
      className={cn(
        "auth-card relative flex w-full flex-col gap-6 text-white",
        showTabs && reserveHeight && "min-h-[724px]",
        className,
      )}
    >
      {showTabs && <Tabs />}
      {children}
    </div>
  );
};

export default AuthCardWrapper;
