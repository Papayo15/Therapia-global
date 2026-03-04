"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md",
        secondary:
          "bg-surface-100 text-surface-800 hover:bg-surface-200",
        outline:
          "border border-surface-200 bg-transparent text-surface-700 hover:bg-surface-50 hover:border-surface-300",
        ghost:
          "text-surface-600 hover:bg-surface-100 hover:text-surface-800",
        danger:
          "bg-red-500 text-white hover:bg-red-600",
        clinical:
          "bg-clinical-500 text-white shadow-sm hover:bg-clinical-600",
        dark:
          "bg-surface-900 text-white hover:bg-surface-800",
        link:
          "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:   "h-7 px-3 text-xs rounded-lg",
        sm:   "h-8 px-3 text-sm",
        md:   "h-10 px-4",
        lg:   "h-11 px-6 text-base",
        xl:   "h-12 px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
