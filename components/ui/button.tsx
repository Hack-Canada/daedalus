import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-blue-400 hover:shadow-[0_0_25px_rgba(30,144,255,0.4)] focus-visible:ring-blue-500 focus-visible:ring-offset-[#0a0a0f]",
        primary:
          "px-8 py-2 bg-linear-to-b from-blue-500 to-blue-600 shadow-lg shadow-primary/25 text-white hover:shadow-[0_0_30px_rgba(30,144,255,0.5)] hover:from-blue-400 hover:to-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-[#0a0a0f] duration-200",
        destructive:
          "bg-error text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(244,67,54,0.4)] focus-visible:ring-error/70 focus-visible:ring-offset-[#0a0a0f]",
        outline:
          "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-primary hover:border-primary/50 hover:shadow-[0_0_15px_rgba(30,144,255,0.2)] focus-visible:ring-primary focus-visible:ring-offset-[#0a0a0f]",
        secondary:
          "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 hover:shadow-[0_0_15px_rgba(255,167,38,0.3)] focus-visible:ring-secondary focus-visible:ring-offset-[#0a0a0f]",
        ghost:
          "text-white/60 hover:bg-white/10 hover:text-primary focus-visible:ring-primary focus-visible:ring-offset-[#0a0a0f]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primaryLight focus-visible:ring-primary",
        auth: "rounded-sm bg-linear-to-r from-[#132C57] to-[#0A1F44] text-white shadow-md hover:shadow-[0_0_20px_rgba(10,31,68,0.6)] hover:tracking-widest focus-visible:ring-[#0A1F44]",
        unstyled: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      loading: {
        true: "cursor-wait opacity-70",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        {...props}
        aria-disabled={props.disabled || loading}
        disabled={props.disabled || loading}
        tabIndex={props.disabled || loading ? -1 : undefined}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
