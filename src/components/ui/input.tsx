import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = "left", ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          {iconPosition === "left" && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900",
              "placeholder:text-surface-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50",
              "transition-colors duration-150",
              iconPosition === "left" && "pl-10",
              iconPosition === "right" && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === "right" && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900",
          "placeholder:text-surface-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50",
          "transition-colors duration-150",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
