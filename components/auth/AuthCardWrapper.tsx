import { cn } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";

type Props = {
  children: React.ReactNode;
  className?: string;
  showTabs?: boolean;
};

const AuthCardWrapper = ({ children, className, showTabs = true }: Props) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-6 text-white",
        // Sign up's height, reserved on both tabs so the centered column (and pill) never moves
        showTabs && "min-h-[724px]",
        className,
      )}
    >
      {showTabs && <Tabs />}
      {children}
    </div>
  );
};

export default AuthCardWrapper;
